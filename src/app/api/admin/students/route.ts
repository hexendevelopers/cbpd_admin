import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import { verifyAdminToken } from "@/lib/verifyToken";

// GET - List all students with advanced filters and statistics
export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.read) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const institution = searchParams.get("institution") || "";
    const department = searchParams.get("department") || "";
    const course = searchParams.get("course") || "";
    const semester = searchParams.get("semester") || "";
    const gender = searchParams.get("gender") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: any = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (institution) {
      query.institutionId = institution;
    }

    if (department) {
      query.department = { $regex: department, $options: "i" };
    }

    if (course) {
      query.currentCourse = { $regex: course, $options: "i" };
    }

    if (semester) {
      query.semester = { $regex: semester, $options: "i" };
    }

    if (gender) {
      query.gender = gender;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const students = await Student.find(query)
      .populate("institutionId", "orgName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    // Get advanced statistics
    const stats = await getStudentStatistics(query);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statistics: stats,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new student (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.create) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const studentData = await request.json();

    // Validate required fields
    const requiredFields = [
      'fullName', 'gender', 'phoneNumber', 'dateOfBirth', 'joiningDate',
      'state', 'district', 'county', 'currentCourse', 'department', 
      'semester', 'admissionNumber', 'institutionId'
    ];

    for (const field of requiredFields) {
      if (!studentData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if admission number already exists
    const existingStudent = await Student.findOne({
      admissionNumber: studentData.admissionNumber,
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student with this admission number already exists" },
        { status: 400 }
      );
    }

    // Verify institution exists
    const institution = await Organization.findById(studentData.institutionId);
    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 400 }
      );
    }

    const newStudent = new Student(studentData);
    await newStudent.save();

    const populatedStudent = await Student.findById(newStudent._id)
      .populate("institutionId", "orgName email");

    return NextResponse.json({
      message: "Student created successfully",
      student: populatedStudent,
    }, { status: 201 });
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Bulk update students
export async function PUT(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.update) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { studentIds, action, updateData } = await request.json();

    if (!studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json(
        { error: "Student IDs are required" },
        { status: 400 }
      );
    }

    let update: any = {};
    
    if (action === "activate") {
      update = { isActive: true };
    } else if (action === "deactivate") {
      update = { isActive: false };
    } else if (action === "update" && updateData) {
      update = updateData;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      update
    );

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} students`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk update students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getStudentStatistics(baseQuery: any = {}) {
  // Total counts
  const totalStudents = await Student.countDocuments(baseQuery);
  const activeStudents = await Student.countDocuments({ ...baseQuery, isActive: true });
  const inactiveStudents = await Student.countDocuments({ ...baseQuery, isActive: false });

  // Gender distribution
  const genderStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$gender",
        count: { $sum: 1 }
      }
    }
  ]);

  // Department distribution
  const departmentStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Course distribution
  const courseStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$currentCourse",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Semester distribution
  const semesterStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$semester",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Institution-wise distribution
  const institutionStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$institutionId",
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "organizations",
        localField: "_id",
        foreignField: "_id",
        as: "institution"
      }
    },
    {
      $unwind: "$institution"
    },
    {
      $project: {
        institutionName: "$institution.orgName",
        count: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Age distribution
  const ageStats = await Student.aggregate([
    { $match: baseQuery },
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), "$dateOfBirth"] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ["$age", 18] }, then: "Under 18" },
              { case: { $lt: ["$age", 21] }, then: "18-20" },
              { case: { $lt: ["$age", 25] }, then: "21-24" },
              { case: { $lt: ["$age", 30] }, then: "25-29" },
            ],
            default: "30+"
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Monthly registration trends (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyTrends = await Student.aggregate([
    {
      $match: {
        ...baseQuery,
        createdAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);

  return {
    overview: {
      total: totalStudents,
      active: activeStudents,
      inactive: inactiveStudents,
      activePercentage: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0
    },
    demographics: {
      gender: genderStats,
      age: ageStats
    },
    academic: {
      departments: departmentStats,
      courses: courseStats,
      semesters: semesterStats
    },
    institutions: institutionStats,
    trends: {
      monthly: monthlyTrends
    }
  };
}