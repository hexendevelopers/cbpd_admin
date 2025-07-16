// app/api/student/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import mongoose from "mongoose";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// Define a custom interface for bulk operation results
interface BulkOperationResult {
  matchedCount: number;
  modifiedCount: number;
}

// Define interfaces for statistics
interface OverviewStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  activationRate: string;
}

interface GenderStat {
  _id: string;
  count: number;
}

interface DepartmentStat {
  _id: string;
  count: number;
}

interface CourseStat {
  _id: string;
  count: number;
}

interface StudentStatistics {
  overview: OverviewStats;
  demographics: {
    gender: GenderStat[];
  };
  academic: {
    topDepartments: DepartmentStat[];
    topCourses: CourseStat[];
  };
}

// POST - Bulk operations (activate/deactivate multiple students)
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const body = await request.json();
    const { action, studentIds } = body;

    // Validate input
    if (!action || !studentIds || !Array.isArray(studentIds)) {
      const badRequestResponse: ApiResponse<never> = {
        success: false,
        error: "Action and studentIds array are required",
      };
      return NextResponse.json(badRequestResponse, { status: 400 });
    }

    // Validate all student IDs
    const invalidIds = studentIds.filter(
      (id) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid student ID format",
        details: [`Invalid IDs: ${invalidIds.join(", ")}`],
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "activate":
        updateData = { isActive: true };
        message = "Students activated successfully";
        break;
      case "deactivate":
        updateData = { isActive: false };
        message = "Students deactivated successfully";
        break;
      default:
        const invalidActionResponse: ApiResponse<never> = {
          success: false,
          error: "Invalid action. Supported actions: activate, deactivate",
        };
        return NextResponse.json(invalidActionResponse, { status: 400 });
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      updateData
    );

    // Create a properly typed response data object
    const responseData: BulkOperationResult = {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };

    const successResponse: ApiResponse<BulkOperationResult> = {
      success: true,
      data: responseData,
      message: `${message}. ${result.modifiedCount} students updated.`,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error in bulk operation:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to perform bulk operation",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET - Get student statistics
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    // Build base query
    const baseQuery: any = {};
    if (institutionId) {
      baseQuery.institutionId = institutionId;
    }

    // Get various statistics
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      genderStats,
      departmentStats,
      courseStats,
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
    ]);

    const statistics: StudentStatistics = {
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
        gender: genderStats as GenderStat[],
      },
      academic: {
        topDepartments: departmentStats as DepartmentStat[],
        topCourses: courseStats as CourseStat[],
      },
    };

    const successResponse: ApiResponse<StudentStatistics> = {
      success: true,
      data: statistics,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching student statistics:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch student statistics",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
