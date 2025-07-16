// app/api/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import { hashPassword } from "@/lib/hashing";
import { generateToken } from "@/lib/generateToken";
import { EmailService } from "@/lib/emailService";

// Types
interface OrganizationQuery {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  isApproved?: boolean;
  isTerminated?: boolean;
}

interface PaginationParams { 
  page: number;
  limit: number;
  search: string;
  isApproved: string | null;
  isTerminated: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  token?: string;
}

// GET - Fetch all organizations
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const page: number = parseInt(searchParams.get("page") || "1");
    const limit: number = parseInt(searchParams.get("limit") || "10");
    const search: string = searchParams.get("search") || "";
    const isApproved: string | null = searchParams.get("isApproved");
    const isTerminated: string | null = searchParams.get("isTerminated");

    const skip: number = (page - 1) * limit;

    // Build query
    const query: OrganizationQuery = {};

    if (search) {
      query.$or = [
        { orgName: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { emailAddress: { $regex: search, $options: "i" } },
      ];
    }

    if (isApproved !== null && isApproved !== undefined) {
      query.isApproved = isApproved === "true";
    }

    if (isTerminated !== null && isTerminated !== undefined) {
      query.isTerminated = isTerminated === "true";
    }

    const organizations = await Organization.find(query)
      .select("-password") // Exclude password from response
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total: number = await Organization.countDocuments(query);

    const response: ApiResponse<typeof organizations> = {
      success: true,
      data: organizations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch organizations",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Create new organization
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const body = await request.json();

    // Check if organization with email already exists
    const existingOrg = await Organization.findOne({
      $or: [{ email: body.email }, { emailAddress: body.emailAddress }],
    });

    if (existingOrg) {
      const conflictResponse: ApiResponse<never> = {
        success: false,
        error: "Organization with this email already exists",
      };
      return NextResponse.json(conflictResponse, { status: 409 });
    }

    // Hash the password before saving
    if (body.password) {
      body.password = hashPassword(body.password);
    }

    const organization = new Organization(body);
    await organization.save();

    // Send registration confirmation email
    try {
      const contactName = `${body.firstName} ${body.lastName}`;
      await EmailService.sendRegistrationConfirmation(
        body.emailAddress,
        body.orgName,
        contactName
      );
      console.log('Registration confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send registration confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // Remove password from response
    const orgResponse = organization.toObject();
    delete orgResponse.password;

    const successResponse: ApiResponse<typeof orgResponse> = {
      success: true,
      data: orgResponse,
      message: "Organization created successfully",
      token: generateToken({ id: orgResponse._id }),
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (error: any) {
    console.error("Error creating organization:", error);

    if (error.name === "ValidationError") {
      const errors: string[] = Object.values(error.errors).map(
        (err: any) => err.message
      );
      const validationErrorResponse: ApiResponse<never> = {
        success: false,
        error: "Validation failed",
        details: errors,
      };
      return NextResponse.json(validationErrorResponse, { status: 400 });
    }

    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to create organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
