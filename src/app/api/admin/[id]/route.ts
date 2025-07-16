import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectDB from "@/configs/mongodb";
import Admin from "@/models/adminModel";
import { verifyAdminToken } from "@/lib/verifyToken";
// import { verifyAdminToken } from "@/lib/verifyToken";

// GET - Get single admin details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const admin = await Admin.findById(params.id).select("-password");
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      admin,
    });
  } catch (error) {
    console.error("Get admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const updateData = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.password; // Password updates should be handled separately

    // If updating email or username, check for duplicates
    if (updateData.email || updateData.username) {
      const query: any = {
        _id: { $ne: params.id }
      };
      
      if (updateData.email && updateData.username) {
        query.$or = [
          { email: updateData.email },
          { username: updateData.username }
        ];
      } else if (updateData.email) {
        query.email = updateData.email;
      } else if (updateData.username) {
        query.username = updateData.username;
      }

      const existingAdmin = await Admin.findOne(query);
      if (existingAdmin) {
        return NextResponse.json(
          { error: "Admin with this email or username already exists" },
          { status: 400 }
        );
      }
    }

    const admin = await Admin.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete admin (super_admin only)
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
    
    // Prevent deleting self
    if (adminData.adminId === params.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const admin = await Admin.findByIdAndDelete(params.id);
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}