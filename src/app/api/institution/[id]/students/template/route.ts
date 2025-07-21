// app/api/organization/[id]/students/template/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import mongoose from "mongoose";
import * as XLSX from "xlsx";

import { verifyInstitutionToken } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// GET - Download Excel template for bulk student import (without images)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken();

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
    const format = searchParams.get("format") || "xlsx";

    // Define template headers based on student model (excluding images and auto-generated fields)
    const headers = [
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

    // User-friendly headers for display
    const displayHeaders = [
      "Full Name",
      "Gender",
      "Phone Number",
      "Date of Birth (YYYY-MM-DD)",
      "Joining Date (YYYY-MM-DD)",
      "State",
      "District",
      "County",
      "Current Course",
      "Department / Branch",
      "Year / Semester",
      "College Admission Number",
    ];

    const sampleData = [
      [
        "John Doe",
        "Male",
        "+1234567890",
        "1995-05-15",
        "2023-09-01",
        "California",
        "Los Angeles",
        "LA County",
        "Computer Science",
        "Engineering",
        "3rd Year",
        "CS2023001",
      ],
      [
        "Jane Smith",
        "Female",
        "+1987654321",
        "1996-08-22",
        "2023-09-01",
        "New York",
        "Manhattan",
        "New York County",
        "Business Administration",
        "Business",
        "2nd Year",
        "BA2023002",
      ],
      [
        "Mike Johnson",
        "Male",
        "+1122334455",
        "1997-03-10",
        "2023-09-01",
        "Texas",
        "Houston",
        "Harris County",
        "Mechanical Engineering",
        "Engineering",
        "1st Year",
        "ME2023003",
      ],
    ];

    if (format === "csv") {
      // Generate CSV template
      const csvContent = [displayHeaders, ...sampleData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${organization.orgName}_student_template.csv"`,
        },
      });
    } else {
      // Generate Excel template
      const workbook = XLSX.utils.book_new();

      // Create instructions sheet
      const instructions = [
        ["STUDENT BULK IMPORT TEMPLATE"],
        [""],
        ["INSTRUCTIONS FOR FILLING THE TEMPLATE:"],
        [""],
        ["1. GENERAL GUIDELINES:"],
        ["   • Fill in the student data in the 'Students Data' sheet"],
        ["   • Do not modify the column headers"],
        ["   • All fields marked as required must be filled"],
        ["   • Save the file and upload it through the bulk import feature"],
        [""],
        ["2. FIELD REQUIREMENTS:"],
        [""],
        ["   Full Name:"],
        ["   • Required field"],
        ["   • Maximum 100 characters"],
        ["   • Example: John Doe"],
        [""],
        ["   Gender:"],
        ["   • Required field"],
        ["   • Allowed values: Male, Female, Other"],
        ["   • Case sensitive"],
        [""],
        ["   Phone Number:"],
        ["   • Required field"],
        ["   • Include country code (e.g., +1234567890)"],
        ["   • Only numbers and + symbol allowed"],
        [""],
        ["   Date of Birth:"],
        ["   • Required field"],
        ["   • Format: YYYY-MM-DD (e.g., 1995-05-15)"],
        ["   • Must be a past date"],
        [""],
        ["   Joining Date:"],
        ["   • Required field"],
        ["   • Format: YYYY-MM-DD (e.g., 2023-09-01)"],
        [""],
        ["   State, District, County:"],
        ["   • All required fields"],
        ["   • Text format"],
        [""],
        ["   Current Course:"],
        ["   • Required field"],
        ["   • Example: Computer Science, Business Administration"],
        [""],
        ["   Department / Branch:"],
        ["   • Required field"],
        ["   • Example: Engineering, Business, Arts"],
        [""],
        ["   Year / Semester:"],
        ["   • Required field"],
        ["   • Example: 1st Year, 2nd Semester, Final Year"],
        [""],
        ["   College Admission Number:"],
        ["   • Required field"],
        ["   • Must be unique across all students"],
        ["   • Example: CS2023001, BA2023002"],
        [""],
        ["3. IMPORTANT NOTES:"],
        ["   • Passport photos and marksheets are NOT included in bulk import"],
        [
          "   • These files must be uploaded individually after student creation",
        ],
        ["   • Use the individual student update API to upload images"],
        ["   • Duplicate admission numbers will cause import failure"],
        ["   • All students will be assigned to: " + organization.orgName],
        ["   • Students will be created with isActive = true by default"],
        [""],
        ["4. VALIDATION RULES:"],
        ["   • Phone numbers must match pattern: +[country code][number]"],
        ["   • Dates must be in YYYY-MM-DD format"],
        ["   • Gender must be exactly: Male, Female, or Other"],
        ["   • All text fields will be trimmed of extra spaces"],
        [""],
        ["5. POST-IMPORT STEPS:"],
        ["   • After successful import, upload passport photos individually"],
        ["   • Upload marksheets individually for each student"],
        ["   • Use PUT /api/organization/[id]/students/[studentId] endpoint"],
        ["   • Include passportPhoto and marksheets files in form data"],
        [""],
        ["Organization: " + organization.orgName],
        ["Generated on: " + new Date().toLocaleDateString()],
        ["Template Version: 4.0 (No Images in Bulk)"],
      ];

      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);

      // Set column widths for instructions
      instructionsSheet["!cols"] = [{ wch: 80 }];

      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");

      // Create field mapping sheet
      const fieldMapping = [
        ["FIELD MAPPING REFERENCE"],
        [""],
        [
          "Excel Column",
          "Database Field",
          "Required",
          "Data Type",
          "Validation",
        ],
        ["Full Name", "fullName", "Yes", "String", "Max 100 characters"],
        ["Gender", "gender", "Yes", "String", "Male, Female, or Other"],
        [
          "Phone Number",
          "phoneNumber",
          "Yes",
          "String",
          "Valid phone format with country code",
        ],
        [
          "Date of Birth",
          "dateOfBirth",
          "Yes",
          "Date",
          "YYYY-MM-DD format, past date",
        ],
        ["Joining Date", "joiningDate", "Yes", "Date", "YYYY-MM-DD format"],
        ["State", "state", "Yes", "String", "Text"],
        ["District", "district", "Yes", "String", "Text"],
        ["County", "county", "Yes", "String", "Text"],
        ["Current Course", "currentCourse", "Yes", "String", "Text"],
        ["Department / Branch", "department", "Yes", "String", "Text"],
        ["Year / Semester", "semester", "Yes", "String", "Text"],
        [
          "College Admission Number",
          "admissionNumber",
          "Yes",
          "String",
          "Unique identifier",
        ],
        ["", "", "", "", ""],
        ["Auto-generated fields (not in template):", "", "", "", ""],
        [
          "institutionId",
          "institutionId",
          "Auto",
          "ObjectId",
          "Set to: " + organizationId,
        ],
        ["isActive", "isActive", "Auto", "Boolean", "Set to: true"],
        [
          "passportPhoto",
          "passportPhoto",
          "Manual",
          "String",
          "Upload separately after creation",
        ],
        [
          "marksheets",
          "marksheets",
          "Manual",
          "Array",
          "Upload separately after creation",
        ],
        ["createdAt", "createdAt", "Auto", "Date", "Auto-generated"],
        ["updatedAt", "updatedAt", "Auto", "Date", "Auto-generated"],
      ];

      const fieldMappingSheet = XLSX.utils.aoa_to_sheet(fieldMapping);

      // Set column widths for field mapping
      fieldMappingSheet["!cols"] = [
        { wch: 25 }, // Excel Column
        { wch: 20 }, // Database Field
        { wch: 10 }, // Required
        { wch: 15 }, // Data Type
        { wch: 50 }, // Validation
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        fieldMappingSheet,
        "Field Mapping"
      );

      // Create students data sheet with headers and sample data
      const studentsData = [displayHeaders, ...sampleData];
      const studentsSheet = XLSX.utils.aoa_to_sheet(studentsData);

      // Set column widths for students data
      const columnWidths = [
        { wch: 20 }, // Full Name
        { wch: 10 }, // Gender
        { wch: 15 }, // Phone Number
        { wch: 18 }, // Date of Birth
        { wch: 18 }, // Joining Date
        { wch: 15 }, // State
        { wch: 15 }, // District
        { wch: 15 }, // County
        { wch: 25 }, // Current Course
        { wch: 20 }, // Department
        { wch: 15 }, // Semester
        { wch: 20 }, // Admission Number
      ];

      studentsSheet["!cols"] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, studentsSheet, "Students Data");

      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${organization.orgName}_student_import_template.xlsx"`,
        },
      });
    }
  } catch (error) {
    console.error("Error generating template:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to generate template",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
