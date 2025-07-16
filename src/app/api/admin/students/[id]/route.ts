import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import { verifyAdminToken } from "@/lib/verifyToken";

// GET - Get single student details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.read) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const student = await Student.findById(params.id)
      .populate("institutionId", "orgName email industrySector businessAddress");
    
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      student,
    });
  } catch (error) {
    console.error("Get student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.students?.update) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If updating admission number, check for duplicates
    if (updateData.admissionNumber) {
      const existingStudent = await Student.findOne({
        admissionNumber: updateData.admissionNumber,
        _id: { $ne: params.id }
      });

      if (existingStudent) {
        return NextResponse.json(
          { error: "Student with this admission number already exists" },
          { status: 400 }
        );
      }
    }

    const student = await Student.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate("institutionId", "orgName email");

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete student (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const student = await Student.findByIdAndDelete(params.id);
    
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}