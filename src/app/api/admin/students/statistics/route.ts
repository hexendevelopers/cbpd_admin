import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.read) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const timeRange = searchParams.get("timeRange") || "all"; // all, 1m, 3m, 6m, 1y

    let dateFilter = {};
    if (timeRange !== "all") {
      const now = new Date();
      const months = timeRange === "1m" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
      dateFilter = { createdAt: { $gte: startDate } };
    }

    const baseQuery = institutionId ? { institutionId, ...dateFilter } : dateFilter;

    // Advanced Statistics
    const statistics = await Promise.all([
      // Basic counts
      Student.countDocuments(baseQuery),
      Student.countDocuments({ ...baseQuery, isActive: true }),
      Student.countDocuments({ ...baseQuery, isActive: false }),

      // Gender distribution
      Student.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$gender", count: { $sum: 1 } } }
      ]),

      // Age distribution with detailed breakdown
      Student.aggregate([
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
                  { case: { $lt: ["$age", 20] }, then: "18-19" },
                  { case: { $lt: ["$age", 22] }, then: "20-21" },
                  { case: { $lt: ["$age", 25] }, then: "22-24" },
                  { case: { $lt: ["$age", 30] }, then: "25-29" },
                ],
                default: "30+"
              }
            },
            count: { $sum: 1 },
            avgAge: { $avg: "$age" }
          }
        },
        { $sort: { "_id": 1 } }
      ]),

      // Department-wise statistics
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            },
            maleCount: {
              $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] }
            },
            femaleCount: {
              $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Course-wise statistics
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$currentCourse",
            count: { $sum: 1 },
            departments: { $addToSet: "$department" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Semester distribution
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$semester",
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ]),

      // State-wise distribution
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$state",
            count: { $sum: 1 },
            districts: { $addToSet: "$district" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),

      // Monthly registration trends (last 12 months)
      Student.aggregate([
        {
          $match: {
            ...baseQuery,
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // Institution-wise distribution (if not filtered by institution)
      !institutionId ? Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$institutionId",
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
            }
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
        { $unwind: "$institution" },
        {
          $project: {
            institutionName: "$institution.orgName",
            institutionEmail: "$institution.email",
            count: 1,
            activeCount: 1,
            activePercentage: {
              $round: [{ $multiply: [{ $divide: ["$activeCount", "$count"] }, 100] }, 2]
            }
          }
        },
        { $sort: { count: -1 } }
      ]) : Promise.resolve([]),

      // Performance metrics
      Student.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            avgAge: {
              $avg: {
                $floor: {
                  $divide: [
                    { $subtract: [new Date(), "$dateOfBirth"] },
                    365.25 * 24 * 60 * 60 * 1000
                  ]
                }
              }
            },
            totalDepartments: { $addToSet: "$department" },
            totalCourses: { $addToSet: "$currentCourse" },
            totalStates: { $addToSet: "$state" }
          }
        },
        {
          $project: {
            avgAge: { $round: ["$avgAge", 1] },
            departmentCount: { $size: "$totalDepartments" },
            courseCount: { $size: "$totalCourses" },
            stateCount: { $size: "$totalStates" }
          }
        }
      ])
    ]);

    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      genderStats,
      ageStats,
      departmentStats,
      courseStats,
      semesterStats,
      stateStats,
      monthlyTrends,
      institutionStats,
      performanceMetrics
    ] = statistics;

    // Calculate growth rate
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthData = monthlyTrends.find(
      (item: any) => item._id.month === currentMonth + 1 && item._id.year === currentYear
    );
    const lastMonthData = monthlyTrends.find(
      (item: any) => item._id.month === lastMonth + 1 && item._id.year === lastMonthYear
    );

    const growthRate = lastMonthData?.count > 0 
      ? Math.round(((currentMonthData?.count || 0) - lastMonthData.count) / lastMonthData.count * 100)
      : 0;

    return NextResponse.json({
      overview: {
        total: totalStudents,
        active: activeStudents,
        inactive: inactiveStudents,
        activePercentage: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0,
        growthRate,
        avgAge: performanceMetrics[0]?.avgAge || 0,
        departmentCount: performanceMetrics[0]?.departmentCount || 0,
        courseCount: performanceMetrics[0]?.courseCount || 0,
        stateCount: performanceMetrics[0]?.stateCount || 0
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
      geographic: {
        states: stateStats
      },
      institutions: institutionStats,
      trends: {
        monthly: monthlyTrends,
        growthRate
      }
    });
  } catch (error) {
    console.error("Student statistics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}