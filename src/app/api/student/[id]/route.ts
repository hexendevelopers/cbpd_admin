// app/api/student/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import { uploadImageToR2 } from "@/configs/uploadFiletoR2";
import mongoose from "mongoose";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// GET - Fetch single student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectToDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid student ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    const student = await Student.findById(id)
      .populate("institutionId", "orgName email");

    if (!student) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const successResponse: ApiResponse<typeof student> = {
      success: true,
      data: student,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching student:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PUT - Update student by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectToDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid student ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    const formData = await request.formData();
    
    // Extract text fields
    const updateData: any = {};
    const textFields = [
      "fullName", "gender", "phoneNumber", "dateOfBirth", "joiningDate",
      "state", "district", "county", "currentCourse", "department", 
      "semester", "admissionNumber", "institutionId", "isActive"
    ];

    textFields.forEach(field => {
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

    // Check if another student has the same admission number (excluding current student)
    if (updateData.admissionNumber) {
      const existingStudent = await Student.findOne({
        _id: { $ne: id },
        admissionNumber: updateData.admissionNumber
      });
      
      if (existingStudent) {
        const conflictResponse: ApiResponse<never> = {
          success: false,
          error: "Another student with this admission number already exists",
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
          const marksheetUrl = await uploadImageToR2(marksheetBuffer, marksheet.type);
          marksheetUrls.push(marksheetUrl);
        }
      }
      
      if (marksheetUrls.length > 0) {
        updateData.marksheets = marksheetUrls;
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("institutionId", "orgName email");

    if (!updatedStudent) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found",
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
    console.error("Error updating student:", error);

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

// DELETE - Delete student by ID (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectToDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid student ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    // Soft delete by setting isActive to false
    const deletedStudent = await Student.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate("institutionId", "orgName email");

    if (!deletedStudent) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Student not found",
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
    console.error("Error deleting student:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to delete student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}