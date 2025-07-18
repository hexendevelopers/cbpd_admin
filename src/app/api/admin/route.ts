import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/configs/mongodb";
import Admin from "@/models/adminModel";
import { verifyAdminToken } from "@/lib/verifyToken";

// GET - List all admins (super_admin only)
export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || adminData.role !== 'super_admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const admins = await Admin.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Admin.countDocuments(query);

    return NextResponse.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create new admin (super_admin only)
export async function POST(request: NextRequest) {
  try {
    // const adminData = await verifyAdminToken(request);
    // if (!adminData || adminData.role !== 'super_admin') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();
    
    const { username, email, password, fullName, role } = await request.json();

    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email or username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: role || 'admin',
    });

    await newAdmin.save();

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return NextResponse.json({
      message: "Admin created successfully",
      admin: adminResponse,
    }, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}