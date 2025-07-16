// app/api/organization/[id]/students/[studentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import { uploadImageToR2 } from "@/configs/uploadFiletoR2";
import mongoose from "mongoose";

import { verifyInstitutionToken } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// GET - Fetch single student by ID for specific organization
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    const { id: organizationId, studentId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(organizationId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization or student ID format",
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

    const student = await Student.findOne({
      _id: studentId,
      institutionId: organizationId,
    }).populate("institutionId", "orgName email");

    if (!student) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found in this organization",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const successResponse: ApiResponse<typeof student> = {
      success: true,
      data: student,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching organization student:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PUT - Update student by ID for specific organization
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    const { id: organizationId, studentId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(organizationId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization or student ID format",
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

    // Verify student belongs to this organization
    const existingStudent = await Student.findOne({
      _id: studentId,
      institutionId: organizationId,
    });

    if (!existingStudent) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found in this organization",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const formData = await request.formData();

    // Extract text fields
    const updateData: any = {};
    const textFields = [
      "fullName",
      "gender",
      "phoneNumber",
      "dateOfBirth",
      "joiningDate",
      "state",
      "district",
      "county",
      "currentCourse",
      "department",
      "semester",
      "admissionNumber",
      "govtIdNumber",
      "isActive",
    ];

    textFields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null) {
        if (field === "dateOfBirth" || field === "joiningDate") {
          updateData[field] = new Date(value as string);
        } else if (field === "isActive") {
          updateData[field] = value === "true";
        } else {
          updateData[field] = value as string;
        }
      }
    });

    // Check if another student in the same organization has the same admission number or govt ID
    if (updateData.admissionNumber || updateData.govtIdNumber) {
      const conflictQuery: any = {
        _id: { $ne: studentId },
        institutionId: organizationId,
        $or: [],
      };

      if (updateData.admissionNumber) {
        conflictQuery.$or.push({ admissionNumber: updateData.admissionNumber });
      }
      if (updateData.govtIdNumber) {
        conflictQuery.$or.push({ govtIdNumber: updateData.govtIdNumber });
      }

      const conflictingStudent = await Student.findOne(conflictQuery);
      if (conflictingStudent) {
        const conflictResponse: ApiResponse<never> = {
          success: false,
          error:
            "Another student in this organization with this admission number or government ID already exists",
        };
        return NextResponse.json(conflictResponse, { status: 409 });
      }
    }

    // Handle passport photo upload
    const passportPhoto = formData.get("passportPhoto") as File;
    if (passportPhoto && passportPhoto.size > 0) {
      const photoBuffer = Buffer.from(await passportPhoto.arrayBuffer());
      const photoUrl = await uploadImageToR2(photoBuffer, passportPhoto.type);
      updateData.passportPhoto = photoUrl;
    }

    // Handle marksheets upload (multiple files)
    const marksheets = formData.getAll("marksheets") as File[];
    if (marksheets.length > 0 && marksheets[0].size > 0) {
      const marksheetUrls: string[] = [];

      for (const marksheet of marksheets) {
        if (marksheet && marksheet.size > 0) {
          const marksheetBuffer = Buffer.from(await marksheet.arrayBuffer());
          const marksheetUrl = await uploadImageToR2(
            marksheetBuffer,
            marksheet.type
          );
          marksheetUrls.push(marksheetUrl);
        }
      }

      if (marksheetUrls.length > 0) {
        updateData.marksheets = marksheetUrls;
      }
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { _id: studentId, institutionId: organizationId },
      updateData,
      { new: true, runValidators: true }
    ).populate("institutionId", "orgName email");

    if (!updatedStudent) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found in this organization",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const successResponse: ApiResponse<typeof updatedStudent> = {
      success: true,
      data: updatedStudent,
      message: "Student updated successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error: any) {
    console.error("Error updating organization student:", error);

    if (error.name === "ValidationError") {
      const errors: string[] = Object.values(error.errors).map(
        (err: any) => err.message
      );
      const validationErrorResponse: ApiResponse<never> = {
        success: false,
        error: "Validation failed",
        details: errors,
      };
      return NextResponse.json(validationErrorResponse, { status: 400 });
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to update student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE - Delete student by ID for specific organization (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; studentId: string } }
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

    const { id: organizationId, studentId } = params;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(organizationId) ||
      !mongoose.Types.ObjectId.isValid(studentId)
    ) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization or student ID format",
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

    // Soft delete by setting isActive to false
    const deletedStudent = await Student.findOneAndUpdate(
      { _id: studentId, institutionId: organizationId },
      { isActive: false },
      { new: true }
    ).populate("institutionId", "orgName email");

    if (!deletedStudent) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found in this organization",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const successResponse: ApiResponse<typeof deletedStudent> = {
      success: true,
      data: deletedStudent,
      message: "Student deactivated successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error deleting organization student:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to delete student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
