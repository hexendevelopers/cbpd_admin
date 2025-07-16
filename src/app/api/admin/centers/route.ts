import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Center from "@/models/centerModel";

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
    const location = searchParams.get("location") || "";
    const status = searchParams.get("status") || "";

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { centreCode: { $regex: search, $options: "i" } },
        { nameOfAffiliatedCentre: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "expired") {
      query.expiryDate = { $lt: new Date() };
    }

    const skip = (page - 1) * limit;

    const [centers, total] = await Promise.all([
      Center.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Center.countDocuments(query)
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return NextResponse.json({
      centers,
      pagination,
      message: "Centers fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching centers:", error);
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
    const { centreCode, location, nameOfAffiliatedCentre, expiryDate } = body;

    // Validate required fields
    if (!centreCode || !location || !nameOfAffiliatedCentre || !expiryDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if centre code already exists
    const existingCenter = await Center.findOne({ centreCode: centreCode.toUpperCase() });
    if (existingCenter) {
      return NextResponse.json(
        { error: "Centre code already exists" },
        { status: 400 }
      );
    }

    const center = new Center({
      centreCode: centreCode.toUpperCase(),
      location,
      nameOfAffiliatedCentre,
      expiryDate: new Date(expiryDate)
    });

    await center.save();

    return NextResponse.json({
      center,
      message: "Center created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating center:", error);
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
    const { centerIds, action } = body;

    if (!centerIds || !Array.isArray(centerIds) || centerIds.length === 0) {
      return NextResponse.json(
        { error: "Center IDs are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case "activate":
        updateData = { isActive: true };
        break;
      case "deactivate":
        updateData = { isActive: false };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    await Center.updateMany(
      { _id: { $in: centerIds } },
      updateData
    );

    return NextResponse.json({
      message: `Centers ${action}d successfully`
    });

  } catch (error) {
    console.error("Error updating centers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}