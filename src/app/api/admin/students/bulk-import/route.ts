export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function POST(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.create) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { students, institutionId } = await request.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students provided for import" }, { status: 400 });
    }

    if (!institutionId) {
      return NextResponse.json({ error: "Institution ID is required" }, { status: 400 });
    }

    // Verify institution exists
    const institution = await Organization.findById(institutionId);
    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 400 });
    }

    const requiredFields = [
      'fullName', 'gender', 'phoneNumber', 'dateOfBirth', 'joiningDate',
      'state', 'district', 'currentCourse', 'department', 
      'semester', 'admissionNumber'
    ];

    const validStudents = [];
    const errors = [];

    // Extract all admission numbers for duplicate checking
    const admissionNumbers = students.map(s => s.admissionNumber).filter(Boolean);

    // Check for duplicates within the current import batch
    const duplicateInBatch = admissionNumbers.filter((item, index) => admissionNumbers.indexOf(item) !== index);
    if (duplicateInBatch.length > 0) {
      return NextResponse.json({ 
        error: `Duplicate admission numbers found in the uploaded file: ${duplicateInBatch.join(', ')}` 
      }, { status: 400 });
    }

    // Check for duplicates in the DB
    const existingStudents = await Student.find({ admissionNumber: { $in: admissionNumbers } }).select('admissionNumber');
    if (existingStudents.length > 0) {
      const existingIds = existingStudents.map(s => s.admissionNumber);
      return NextResponse.json({ 
        error: `The following admission numbers already exist in the database: ${existingIds.join(', ')}` 
      }, { status: 400 });
    }

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      let hasError = false;

      for (const field of requiredFields) {
        if (!student[field]) {
          errors.push(`Row ${i + 2}: ${field} is required`);
          hasError = true;
          break;
        }
      }

      if (!hasError) {
        validStudents.push({
          ...student,
          institutionId,
          isActive: true
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const result = await Student.insertMany(validStudents);

    return NextResponse.json({
      message: `Successfully imported ${result.length} students`,
      count: result.length,
    }, { status: 201 });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
