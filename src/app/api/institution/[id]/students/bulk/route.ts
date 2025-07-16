// app/api/organization/[id]/students/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import mongoose from "mongoose";

import { verifyInstitutionToken } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// POST - Bulk operations for organization students (activate/deactivate/delete)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken(request);

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

    // Verify all students belong to this organization
    const studentsInOrg = await Student.find({
      _id: { $in: studentIds },
      institutionId: organizationId,
    });

    if (studentsInOrg.length !== studentIds.length) {
      const unauthorizedResponse: ApiResponse<never> = {
        success: false,
        error: "Some students do not belong to this organization",
      };
      return NextResponse.json(unauthorizedResponse, { status: 403 });
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
      case "delete":
        // Soft delete by setting isActive to false
        updateData = { isActive: false };
        message = "Students deleted successfully";
        break;
      default:
        const invalidActionResponse: ApiResponse<never> = {
          success: false,
          error:
            "Invalid action. Supported actions: activate, deactivate, delete",
        };
        return NextResponse.json(invalidActionResponse, { status: 400 });
    }

    const result = await Student.updateMany(
      {
        _id: { $in: studentIds },
        institutionId: organizationId,
      },
      updateData
    );

    const successResponse: ApiResponse<any> = {
      success: true,
      data: result,
      message: `${message}. ${result.modifiedCount} students updated.`,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error in organization bulk operation:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to perform bulk operation",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET - Export organization students data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken(request);

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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const isActive = searchParams.get("isActive");

    // Build query
    const query: any = { institutionId: organizationId };
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const students = await Student.find(query)
      .populate("institutionId", "orgName email")
      .sort({ createdAt: -1 });

    if (format === "csv") {
      // Return CSV format
      const csvHeaders = [
        "Full Name",
        "Gender",
        "Phone Number",
        "Date of Birth",
        "Joining Date",
        "State",
        "District",
        "County",
        "Current Course",
        "Department",
        "Semester",
        "Admission Number",
        "Government ID",
        "Is Active",
        "Created At",
      ];

      const csvRows = students.map((student) => [
        student.fullName,
        student.gender,
        student.phoneNumber,
        student.dateOfBirth
          ? new Date(student.dateOfBirth).toLocaleDateString()
          : "",
        student.joiningDate
          ? new Date(student.joiningDate).toLocaleDateString()
          : "",
        student.state,
        student.district,
        student.county,
        student.currentCourse,
        student.department,
        student.semester,
        student.admissionNumber,
        student.isActive ? "Yes" : "No",
        student.createdAt
          ? new Date(student.createdAt).toLocaleDateString()
          : "",
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${organization.orgName}_students.csv"`,
        },
      });
    }

    // Return JSON format
    const successResponse: ApiResponse<typeof students> = {
      success: true,
      data: students,
      message: `Exported ${students.length} students`,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error exporting organization students:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to export students data",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
