import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/configs/mongodb";
import Center from "@/models/centerModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const centerName = searchParams.get("centerName") || "";
    const centerCode = searchParams.get("centerCode") || "";
    const location = searchParams.get("location") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build search query
    const query: any = {};

    // Search by center name (partial match, case insensitive)
    if (centerName) {
      query.nameOfAffiliatedCentre = { $regex: centerName, $options: "i" };
    }

    // Search by center code (exact match, case insensitive)
    if (centerCode) {
      query.centreCode = { $regex: `^${centerCode}$`, $options: "i" };
    }

    // Search by location (partial match, case insensitive)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Filter by status
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // Add expiry date filter for active centers
    if (status === "expired") {
      query.expiryDate = { $lt: new Date() };
    } else if (status === "valid") {
      query.expiryDate = { $gte: new Date() };
    }

    const skip = (page - 1) * limit;

    // Execute search with pagination
    const [centers, total] = await Promise.all([
      Center.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Center.countDocuments(query),
    ]);

    // Add additional computed fields
    const enrichedCenters = centers.map((center) => ({
      ...center.toObject(),
      isExpired: center.expiryDate < new Date(),
      daysUntilExpiry: Math.ceil(
        (center.expiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      status: center.isActive
        ? center.expiryDate < new Date()
          ? "Expired"
          : "Active"
        : "Inactive",
    }));

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      centers: enrichedCenters,
      pagination,
      searchCriteria: {
        centerName,
        centerCode,
        location,
        status,
      },
      message: "Centers search completed successfully",
    });
  } catch (error) {
    console.error("Error searching centers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { searchTerms } = body;

    if (!searchTerms || (!searchTerms.centerName && !searchTerms.centerCode)) {
      return NextResponse.json(
        { error: "Please provide either center name or center code to search" },
        { status: 400 }
      );
    }

    // Build advanced search query
    const query: any = {};

    if (searchTerms.centerName && searchTerms.centerCode) {
      // Search by both name and code (AND condition)
      query.$and = [
        {
          nameOfAffiliatedCentre: {
            $regex: searchTerms.centerName,
            $options: "i",
          },
        },
        {
          centreCode: { $regex: `^${searchTerms.centerCode}$`, $options: "i" },
        },
      ];
    } else if (searchTerms.centerName) {
      // Search by name only
      query.nameOfAffiliatedCentre = {
        $regex: searchTerms.centerName,
        $options: "i",
      };
    } else if (searchTerms.centerCode) {
      // Search by code only
      query.centreCode = {
        $regex: `^${searchTerms.centerCode}$`,
        $options: "i",
      };
    }

    // Additional filters
    if (searchTerms.location) {
      query.location = { $regex: searchTerms.location, $options: "i" };
    }

    if (searchTerms.isActive !== undefined) {
      query.isActive = searchTerms.isActive;
    }

    // Execute search
    const centers = await Center.find(query).sort({ createdAt: -1 });

    // Add computed fields
    const enrichedCenters = centers.map((center) => ({
      ...center.toObject(),
      isExpired: center.expiryDate < new Date(),
      daysUntilExpiry: Math.ceil(
        (center.expiryDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      status: center.isActive
        ? center.expiryDate < new Date()
          ? "Expired"
          : "Active"
        : "Inactive",
    }));

    return NextResponse.json({
      centers: enrichedCenters,
      searchTerms,
      totalFound: centers.length,
      message: "Advanced centers search completed successfully",
    });
  } catch (error) {
    console.error("Error in advanced centers search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
