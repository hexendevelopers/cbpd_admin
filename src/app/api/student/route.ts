// app/api/student/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import { uploadImageToR2 } from "@/configs/uploadFiletoR2";

// Types
interface StudentQuery {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
  institutionId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// GET - Fetch all students
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page: number = parseInt(searchParams.get("page") || "1");
    const limit: number = parseInt(searchParams.get("limit") || "10");
    const search: string = searchParams.get("search") || "";
    const isActive: string | null = searchParams.get("isActive");
    const institutionId: string | null = searchParams.get("institutionId");

    const skip: number = (page - 1) * limit;

    // Build query
    const query: StudentQuery = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
        { currentCourse: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (institutionId) {
      query.institutionId = institutionId;
    }

    const students = await Student.find(query)
      .populate("institutionId", "orgName email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total: number = await Student.countDocuments(query);

    const response: ApiResponse<typeof students> = {
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching students:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch students",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Create new student
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const formData = await request.formData();
    
    // Extract text fields
    const studentData: any = {};
    const textFields = [
      "fullName", "gender", "phoneNumber", "dateOfBirth", "joiningDate",
      "state", "district", "county", "currentCourse", "department", 
      "semester", "admissionNumber", "institutionId"
    ];

    textFields.forEach(field => {
      const value = formData.get(field);
      if (value) {
        if (field === "dateOfBirth" || field === "joiningDate") {
          studentData[field] = new Date(value as string);
        } else {
          studentData[field] = value as string;
        }
      }
    });

    // Check if student with admission number already exists
    const existingStudent = await Student.findOne({
      admissionNumber: studentData.admissionNumber
    });

    if (existingStudent) {
      const conflictResponse: ApiResponse<never> = {
        success: false,
        error: "Student with this admission number already exists",
      };
      return NextResponse.json(conflictResponse, { status: 409 });
    }

    // Handle passport photo upload
    const passportPhoto = formData.get("passportPhoto") as File;
    if (passportPhoto) {
      const photoBuffer = Buffer.from(await passportPhoto.arrayBuffer());
      const photoUrl = await uploadImageToR2(photoBuffer, passportPhoto.type);
      studentData.passportPhoto = photoUrl;
    }

    // Handle marksheets upload (multiple files)
    const marksheetUrls: string[] = [];
    const marksheets = formData.getAll("marksheets") as File[];
    
    for (const marksheet of marksheets) {
      if (marksheet && marksheet.size > 0) {
        const marksheetBuffer = Buffer.from(await marksheet.arrayBuffer());
        const marksheetUrl = await uploadImageToR2(marksheetBuffer, marksheet.type);
        marksheetUrls.push(marksheetUrl);
      }
    }
    
    if (marksheetUrls.length > 0) {
      studentData.marksheets = marksheetUrls;
    }

    const student = new Student(studentData);
    await student.save();

    const populatedStudent = await Student.findById(student._id)
      .populate("institutionId", "orgName email");

    const successResponse: ApiResponse<typeof populatedStudent> = {
      success: true,
      data: populatedStudent,
      message: "Student created successfully",
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);

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
      error: "Failed to create student",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}