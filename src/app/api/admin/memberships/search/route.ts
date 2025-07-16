import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Membership from "@/models/membershipModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const membershipName = searchParams.get("membershipName") || "";
    const membershipNumber = searchParams.get("membershipNumber") || "";
    const membershipType = searchParams.get("membershipType") || "";
    const membershipStatus = searchParams.get("membershipStatus") || "";
    const isActive = searchParams.get("isActive") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build search query
    const query: any = {};

    // Search by membership name (partial match, case insensitive)
    if (membershipName) {
      query.membershipName = { $regex: membershipName, $options: "i" };
    }

    // Search by membership number (exact match, case insensitive)
    if (membershipNumber) {
      query.membershipNumber = {
        $regex: `^${membershipNumber}$`,
        $options: "i",
      };
    }

    // Filter by membership type
    if (membershipType) {
      query.membershipType = membershipType;
    }

    // Filter by membership status
    if (membershipStatus) {
      query.membershipStatus = membershipStatus;
    }

    // Filter by active status
    if (isActive === "true") {
      query.isActive = true;
    } else if (isActive === "false") {
      query.isActive = false;
    }

    // Add validity period filters
    const now = new Date();
    if (
      membershipStatus === "Expired" ||
      searchParams.get("expired") === "true"
    ) {
      query["validityPeriod.endDate"] = { $lt: now };
    } else if (
      membershipStatus === "Active" ||
      searchParams.get("valid") === "true"
    ) {
      query["validityPeriod.endDate"] = { $gte: now };
      query["validityPeriod.startDate"] = { $lte: now };
    }

    const skip = (page - 1) * limit;

    // Execute search with pagination
    const [memberships, total] = await Promise.all([
      Membership.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Membership.countDocuments(query),
    ]);

    // Add additional computed fields
    const enrichedMemberships = memberships.map((membership) => {
      const now = new Date();
      const startDate = new Date(membership.validityPeriod.startDate);
      const endDate = new Date(membership.validityPeriod.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = endDate < now;
      const isValid = startDate <= now && endDate >= now;

      return {
        ...membership.toObject(),
        isExpired,
        isValid,
        daysUntilExpiry,
        validityStatus: isExpired
          ? "Expired"
          : isValid
          ? "Valid"
          : "Not Started",
        membershipDuration: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      memberships: enrichedMemberships,
      pagination,
      searchCriteria: {
        membershipName,
        membershipNumber,
        membershipType,
        membershipStatus,
        isActive,
      },
      message: "Memberships search completed successfully",
    });
  } catch (error) {
    console.error("Error searching memberships:", error);
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

    if (
      !searchTerms ||
      (!searchTerms.membershipName && !searchTerms.membershipNumber)
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide either membership name or membership number to search",
        },
        { status: 400 }
      );
    }

    // Build advanced search query
    const query: any = {};

    if (searchTerms.membershipName && searchTerms.membershipNumber) {
      // Search by both name and number (AND condition)
      query.$and = [
        {
          membershipName: { $regex: searchTerms.membershipName, $options: "i" },
        },
        {
          membershipNumber: {
            $regex: `^${searchTerms.membershipNumber}$`,
            $options: "i",
          },
        },
      ];
    } else if (searchTerms.membershipName) {
      // Search by name only
      query.membershipName = {
        $regex: searchTerms.membershipName,
        $options: "i",
      };
    } else if (searchTerms.membershipNumber) {
      // Search by number only
      query.membershipNumber = {
        $regex: `^${searchTerms.membershipNumber}$`,
        $options: "i",
      };
    }

    // Additional filters
    if (searchTerms.membershipType) {
      query.membershipType = searchTerms.membershipType;
    }

    if (searchTerms.membershipStatus) {
      query.membershipStatus = searchTerms.membershipStatus;
    }

    if (searchTerms.isActive !== undefined) {
      query.isActive = searchTerms.isActive;
    }

    // Date range filters
    if (searchTerms.startDateFrom || searchTerms.startDateTo) {
      query["validityPeriod.startDate"] = {};
      if (searchTerms.startDateFrom) {
        query["validityPeriod.startDate"].$gte = new Date(
          searchTerms.startDateFrom
        );
      }
      if (searchTerms.startDateTo) {
        query["validityPeriod.startDate"].$lte = new Date(
          searchTerms.startDateTo
        );
      }
    }

    if (searchTerms.endDateFrom || searchTerms.endDateTo) {
      query["validityPeriod.endDate"] = {};
      if (searchTerms.endDateFrom) {
        query["validityPeriod.endDate"].$gte = new Date(
          searchTerms.endDateFrom
        );
      }
      if (searchTerms.endDateTo) {
        query["validityPeriod.endDate"].$lte = new Date(searchTerms.endDateTo);
      }
    }

    // Execute search
    const memberships = await Membership.find(query).sort({ createdAt: -1 });

    // Add computed fields
    const enrichedMemberships = memberships.map((membership) => {
      const now = new Date();
      const startDate = new Date(membership.validityPeriod.startDate);
      const endDate = new Date(membership.validityPeriod.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const isExpired = endDate < now;
      const isValid = startDate <= now && endDate >= now;

      return {
        ...membership.toObject(),
        isExpired,
        isValid,
        daysUntilExpiry,
        validityStatus: isExpired
          ? "Expired"
          : isValid
          ? "Valid"
          : "Not Started",
        membershipDuration: Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
      };
    });

    return NextResponse.json({
      memberships: enrichedMemberships,
      searchTerms,
      totalFound: memberships.length,
      message: "Advanced memberships search completed successfully",
    });
  } catch (error) {
    console.error("Error in advanced memberships search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
