import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import Student from "@/models/studentModel";
import { verifyAdminToken } from "@/lib/verifyToken";

// GET - List all institutions with filters
export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: any = {};
    
    if (search) {
      query.$or = [
        { orgName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { industrySector: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "approved") {
      query.isApproved = true;
      query.isTerminated = false;
    } else if (status === "pending") {
      query.isApproved = false;
      query.isTerminated = false;
    } else if (status === "terminated") {
      query.isTerminated = true;
    }

    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const institutions = await Organization.find(query)
      .select("-password")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get student counts for each institution
    const institutionsWithCounts = await Promise.all(
      institutions.map(async (institution) => {
        const studentCount = await Student.countDocuments({
          institutionId: institution._id,
        });
        return {
          ...institution.toObject(),
          studentCount,
        };
      })
    );

    const total = await Organization.countDocuments(query);

    return NextResponse.json({
      institutions: institutionsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get institutions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Bulk approve/terminate institutions
export async function PUT(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.institutions?.approve) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    
    const { institutionIds, action } = await request.json();

    if (!institutionIds || !Array.isArray(institutionIds) || !action) {
      return NextResponse.json(
        { error: "Institution IDs and action are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    if (action === "approve") {
      updateData = { isApproved: true, isTerminated: false };
    } else if (action === "terminate") {
      updateData = { isTerminated: true };
    } else if (action === "reactivate") {
      updateData = { isTerminated: false };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await Organization.updateMany(
      { _id: { $in: institutionIds } },
      updateData
    );

    return NextResponse.json({
      message: `Successfully ${action}d ${result.modifiedCount} institutions`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk update institutions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}