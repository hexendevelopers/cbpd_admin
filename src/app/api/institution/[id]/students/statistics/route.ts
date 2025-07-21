// app/api/organization/[id]/students/statistics/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import mongoose from "mongoose";
import { verifyInstitutionToken, protectOrg } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// GET - Get student statistics for a specific organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await protectOrg(request);

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();

    const { id: organizationId } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Organization not found",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    // Convert organizationId to ObjectId for proper matching
    const orgObjectId = new mongoose.Types.ObjectId(organizationId);
    const baseQuery = { institutionId: orgObjectId };

    // Get various statistics
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      genderStats,
      departmentStats,
      courseStats,
      semesterStats,
      stateStats,
      recentStudents,
      monthlyRegistrations,
    ] = await Promise.all([
      Student.countDocuments(baseQuery),
      Student.countDocuments({ ...baseQuery, isActive: true }),
      Student.countDocuments({ ...baseQuery, isActive: false }),
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$currentCourse", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$semester", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Student.find(baseQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullName admissionNumber currentCourse createdAt"),
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),
    ]);

    // Calculate age distribution
    const ageStats = await Student.aggregate([
      { $match: baseQuery },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$dateOfBirth"] },
                365.25 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [16, 20, 25, 30, 35, 100],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    const statistics = {
      overview: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        activationRate:
          totalStudents > 0
            ? ((activeStudents / totalStudents) * 100).toFixed(2)
            : "0",
      },
      demographics: {
        gender: genderStats,
        age: ageStats,
        states: stateStats,
      },
      academic: {
        departments: departmentStats,
        courses: courseStats,
        semesters: semesterStats,
      },
      trends: {
        monthlyRegistrations: monthlyRegistrations.map((item) => ({
          month: `${item._id.year}-${item._id.month
            .toString()
            .padStart(2, "0")}`,
          count: item.count,
        })),
      },
      recent: {
        students: recentStudents,
      },
      organization: {
        name: organization.orgName,
        email: organization.email,
      },
    };

    const successResponse: ApiResponse<typeof statistics> = {
      success: true,
      data: statistics,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching organization student statistics:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch organization student statistics",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
