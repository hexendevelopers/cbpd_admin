// app/api/organization/[id]/students/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import { uploadImageToR2 } from "@/configs/uploadFiletoR2";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import { verifyInstitutionToken } from "@/lib/verifyToken";

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

interface StudentData {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: Date | null;
  joiningDate: Date | null;
  state: string;
  district: string;
  county: string;
  currentCourse: string;
  department: string;
  semester: string;
  admissionNumber: string;
  institutionId: string;
  isActive: boolean;
  marksheets: string[];
  passportPhoto: string;
}

// GET - Fetch all students for a specific organization
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
    const page: number = parseInt(searchParams.get("page") || "1");
    const limit: number = parseInt(searchParams.get("limit") || "10");
    const search: string = searchParams.get("search") || "";
    const isActive: string | null = searchParams.get("isActive");

    const skip: number = (page - 1) * limit;

    // Build query
    const query: any = { institutionId: organizationId };

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
    console.error("Error fetching organization students:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch organization students",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Create students for organization (single or bulk from file)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
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

    const formData = await request.formData();
    const bulkFile = formData.get("bulkFile") as File;

    if (bulkFile) {
      // Handle bulk import from Excel/CSV (without images)
      return await handleBulkImport(bulkFile, organizationId);
    } else {
      // Handle single student creation
      return await handleSingleStudentCreation(formData, organizationId);
    }
  } catch (error: any) {
    console.error("Error creating students:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to create students",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper function for single student creation
async function handleSingleStudentCreation(
  formData: FormData,
  organizationId: string
): Promise<NextResponse> {
  const studentData: any = { institutionId: organizationId };
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
  ];

  textFields.forEach((field) => {
    const value = formData.get(field);
    if (value) {
      if (field === "dateOfBirth" || field === "joiningDate") {
        studentData[field] = new Date(value as string);
      } else {
        studentData[field] = value as string;
      }
    }
  });

  // Check for existing student
  const existingStudent = await Student.findOne({
    admissionNumber: studentData.admissionNumber,
  });

  if (existingStudent) {
    const conflictResponse: ApiResponse<never> = {
      success: false,
      error: "Student with this admission number already exists",
    };
    return NextResponse.json(conflictResponse, { status: 409 });
  }

  // Handle file uploads (traditional way for single student creation)
  const passportPhoto = formData.get("passportPhoto") as File;
  if (passportPhoto) {
    const photoBuffer = Buffer.from(await passportPhoto.arrayBuffer());
    const photoUrl = await uploadImageToR2(photoBuffer, passportPhoto.type);
    studentData.passportPhoto = photoUrl;
  }

  const marksheetUrls: string[] = [];
  const marksheets = formData.getAll("marksheets") as File[];

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
    studentData.marksheets = marksheetUrls;
  }

  const student = new Student(studentData);
  await student.save();

  const populatedStudent = await Student.findById(student._id).populate(
    "institutionId",
    "orgName email"
  );

  const successResponse: ApiResponse<typeof populatedStudent> = {
    success: true,
    data: populatedStudent,
    message: "Student created successfully",
  };

  return NextResponse.json(successResponse, { status: 201 });
}

// Helper function for bulk import (without image processing)
async function handleBulkImport(
  file: File,
  organizationId: string
): Promise<NextResponse> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let studentsData: any[] = [];

    // Parse file based on type
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: "buffer" });

      // Look for the "Students Data" sheet first, then fall back to first sheet
      let sheetName = "Students Data";
      if (!workbook.Sheets[sheetName]) {
        sheetName = workbook.SheetNames[0];
      }

      const worksheet = workbook.Sheets[sheetName];
      studentsData = XLSX.utils.sheet_to_json(worksheet);
    } else if (file.name.endsWith(".csv")) {
      // Parse CSV file
      const csvText = buffer.toString("utf-8");
      studentsData = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else {
      const invalidFileResponse: ApiResponse<never> = {
        success: false,
        error:
          "Invalid file format. Please upload Excel (.xlsx, .xls) or CSV (.csv) file",
      };
      return NextResponse.json(invalidFileResponse, { status: 400 });
    }

    if (studentsData.length === 0) {
      const emptyFileResponse: ApiResponse<never> = {
        success: false,
        error: "No data found in the uploaded file",
      };
      return NextResponse.json(emptyFileResponse, { status: 400 });
    }

    // Validate and process students data
    const processedStudents: StudentData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < studentsData.length; i++) {
      const row = studentsData[i];
      const rowNumber = i + 2; // +2 because Excel rows start from 1 and we skip header

      try {
        // Map Excel columns to database fields - handle both field names and display names
        const studentData: StudentData = {
          fullName: row.fullName || row["Full Name"] || "",
          gender: row.gender || row["Gender"] || "",
          phoneNumber: row.phoneNumber || row["Phone Number"] || "",
          dateOfBirth:
            row.dateOfBirth ||
            row["Date of Birth (YYYY-MM-DD)"] ||
            row["Date of Birth"]
              ? new Date(
                  row.dateOfBirth ||
                    row["Date of Birth (YYYY-MM-DD)"] ||
                    row["Date of Birth"]
                )
              : null,
          joiningDate:
            row.joiningDate ||
            row["Joining Date (YYYY-MM-DD)"] ||
            row["Joining Date"]
              ? new Date(
                  row.joiningDate ||
                    row["Joining Date (YYYY-MM-DD)"] ||
                    row["Joining Date"]
                )
              : null,
          state: row.state || row["State"] || "",
          district: row.district || row["District"] || "",
          county: row.county || row["County"] || "",
          currentCourse: row.currentCourse || row["Current Course"] || "",
          department:
            row.department ||
            row["Department / Branch"] ||
            row["Department"] ||
            "",
          semester:
            row.semester || row["Year / Semester"] || row["Semester"] || "",
          admissionNumber:
            row.admissionNumber ||
            row["College Admission Number"] ||
            row["Admission Number"] ||
            "",
          institutionId: organizationId,
          isActive: true,
          marksheets: [], // Empty array - to be uploaded separately
          passportPhoto: "", // Empty string - to be uploaded separately
        };

        // Enhanced validation
        const validationErrors: string[] = [];

        if (!studentData.fullName || studentData.fullName.trim().length === 0) {
          validationErrors.push("Full name is required");
        } else if (studentData.fullName.length > 100) {
          validationErrors.push("Full name cannot exceed 100 characters");
        }

        if (
          !studentData.gender ||
          !["Male", "Female", "Other"].includes(studentData.gender)
        ) {
          validationErrors.push("Gender must be Male, Female, or Other");
        }

        if (
          !studentData.phoneNumber ||
          studentData.phoneNumber.trim().length === 0
        ) {
          validationErrors.push("Phone number is required");
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(studentData.phoneNumber)) {
          validationErrors.push(
            "Invalid phone number format. Use format: +1234567890"
          );
        }

        if (!studentData.dateOfBirth) {
          validationErrors.push("Date of birth is required");
        } else if (isNaN(studentData.dateOfBirth.getTime())) {
          validationErrors.push("Invalid date of birth format. Use YYYY-MM-DD");
        } else if (studentData.dateOfBirth >= new Date()) {
          validationErrors.push("Date of birth must be in the past");
        }

        if (!studentData.joiningDate) {
          validationErrors.push("Joining date is required");
        } else if (isNaN(studentData.joiningDate.getTime())) {
          validationErrors.push("Invalid joining date format. Use YYYY-MM-DD");
        }

        if (!studentData.state || studentData.state.trim().length === 0) {
          validationErrors.push("State is required");
        }

        if (!studentData.district || studentData.district.trim().length === 0) {
          validationErrors.push("District is required");
        }

        if (!studentData.county || studentData.county.trim().length === 0) {
          validationErrors.push("County is required");
        }

        if (
          !studentData.currentCourse ||
          studentData.currentCourse.trim().length === 0
        ) {
          validationErrors.push("Current course is required");
        }

        if (
          !studentData.department ||
          studentData.department.trim().length === 0
        ) {
          validationErrors.push("Department is required");
        }

        if (!studentData.semester || studentData.semester.trim().length === 0) {
          validationErrors.push("Semester is required");
        }

        if (
          !studentData.admissionNumber ||
          studentData.admissionNumber.trim().length === 0
        ) {
          validationErrors.push("Admission number is required");
        }

        if (validationErrors.length > 0) {
          errors.push(`Row ${rowNumber}: ${validationErrors.join(", ")}`);
          continue;
        }

        // Trim all string fields using proper typing
        const stringFields: (keyof StudentData)[] = [
          "fullName",
          "gender",
          "phoneNumber",
          "state",
          "district",
          "county",
          "currentCourse",
          "department",
          "semester",
          "admissionNumber",
          "institutionId",
          "passportPhoto",
        ];

        stringFields.forEach((field) => {
          if (typeof studentData[field] === "string") {
            (studentData[field] as string) = (
              studentData[field] as string
            ).trim();
          }
        });

        processedStudents.push(studentData);
      } catch (error: any) {
        errors.push(`Row ${rowNumber}: Invalid data format - ${error.message}`);
      }
    }

    if (errors.length > 0) {
      const validationErrorResponse: ApiResponse<never> = {
        success: false,
        error: "Validation errors found in uploaded file",
        details: errors,
      };
      return NextResponse.json(validationErrorResponse, { status: 400 });
    }

    if (processedStudents.length === 0) {
      const noValidDataResponse: ApiResponse<never> = {
        success: false,
        error: "No valid student data found in the uploaded file",
      };
      return NextResponse.json(noValidDataResponse, { status: 400 });
    }

    // Check for duplicate admission numbers within the file
    const admissionNumbers = processedStudents.map((s) => s.admissionNumber);
    const duplicateAdmissionNumbers = admissionNumbers.filter(
      (item, index) => admissionNumbers.indexOf(item) !== index
    );

    if (duplicateAdmissionNumbers.length > 0) {
      const duplicateErrors: string[] = [];
      duplicateErrors.push(
        `Duplicate admission numbers in file: ${Array.from(
          new Set(duplicateAdmissionNumbers)
        ).join(", ")}`
      );

      const duplicateResponse: ApiResponse<never> = {
        success: false,
        error: "Duplicate data found within the uploaded file",
        details: duplicateErrors,
      };
      return NextResponse.json(duplicateResponse, { status: 409 });
    }

    // Check for existing students in database
    const existingStudents = await Student.find({
      admissionNumber: { $in: admissionNumbers },
    });

    if (existingStudents.length > 0) {
      const duplicateErrors = existingStudents.map(
        (student) =>
          `Student with admission number "${student.admissionNumber}" already exists`
      );

      const duplicateResponse: ApiResponse<never> = {
        success: false,
        error: "Duplicate students found in database",
        details: duplicateErrors,
      };
      return NextResponse.json(duplicateResponse, { status: 409 });
    }

    // Insert all students
    const createdStudents = await Student.insertMany(processedStudents);

    const successResponse: ApiResponse<any> = {
      success: true,
      data: {
        totalProcessed: studentsData.length,
        successfullyCreated: createdStudents.length,
        createdStudents: createdStudents,
      },
      message: `Successfully imported ${createdStudents.length} students. Note: Passport photos and marksheets need to be uploaded separately for each student.`,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (error: any) {
    console.error("Error in bulk import:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to process bulk import: " + error.message,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
