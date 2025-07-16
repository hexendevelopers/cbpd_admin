import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Membership from "@/models/membershipModel";

export async function GET(request: NextRequest) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const membershipType = searchParams.get("membershipType") || "";
    const membershipStatus = searchParams.get("membershipStatus") || "";

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { membershipName: { $regex: search, $options: "i" } },
        { membershipNumber: { $regex: search, $options: "i" } }
      ];
    }

    if (membershipType) {
      query.membershipType = membershipType;
    }

    if (membershipStatus) {
      query.membershipStatus = membershipStatus;
    }

    const skip = (page - 1) * limit;

    const [memberships, total] = await Promise.all([
      Membership.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Membership.countDocuments(query)
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return NextResponse.json({
      memberships,
      pagination,
      message: "Memberships fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const body = await request.json();
    const { 
      membershipName, 
      membershipNumber, 
      membershipType, 
      membershipStatus,
      validityPeriod 
    } = body;

    // Validate required fields
    if (!membershipName || !membershipNumber || !membershipType || !membershipStatus || !validityPeriod) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if membership number already exists
    const existingMembership = await Membership.findOne({ 
      membershipNumber: membershipNumber.toUpperCase() 
    });
    if (existingMembership) {
      return NextResponse.json(
        { error: "Membership number already exists" },
        { status: 400 }
      );
    }

    const membership = new Membership({
      membershipName,
      membershipNumber: membershipNumber.toUpperCase(),
      membershipType,
      membershipStatus,
      validityPeriod: {
        startDate: new Date(validityPeriod.startDate),
        endDate: new Date(validityPeriod.endDate)
      }
    });

    await membership.save();

    return NextResponse.json({
      membership,
      message: "Membership created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const body = await request.json();
    const { membershipIds, action } = body;

    if (!membershipIds || !Array.isArray(membershipIds) || membershipIds.length === 0) {
      return NextResponse.json(
        { error: "Membership IDs are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case "activate":
        updateData = { membershipStatus: "Active" };
        break;
      case "deactivate":
        updateData = { membershipStatus: "Inactive" };
        break;
      case "suspend":
        updateData = { membershipStatus: "Suspended" };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    await Membership.updateMany(
      { _id: { $in: membershipIds } },
      updateData
    );

    return NextResponse.json({
      message: `Memberships ${action}d successfully`
    });

  } catch (error) {
    console.error("Error updating memberships:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}