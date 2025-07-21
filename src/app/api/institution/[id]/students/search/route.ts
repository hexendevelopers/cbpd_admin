// app/api/organization/[id]/students/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Student from "@/models/studentModel";
import Organization from "@/models/institutionModel";
import mongoose from "mongoose";

import { verifyInstitutionToken } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// POST - Advanced search for organization students
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken(request);

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }
    await connectToDB();

    const { id: organizationId } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Organization not found",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const body = await request.json();
    const {
      filters = {},
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = body;

    const skip: number = (page - 1) * limit;

    // Build query from filters - always include organization filter
    const query: any = { institutionId: organizationId };

    // Text search filters
    if (filters.fullName) {
      query.fullName = { $regex: filters.fullName, $options: "i" };
    }
    if (filters.gender) {
      query.gender = filters.gender;
    }
    if (filters.state) {
      query.state = { $regex: filters.state, $options: "i" };
    }
    if (filters.district) {
      query.district = { $regex: filters.district, $options: "i" };
    }
    if (filters.county) {
      query.county = { $regex: filters.county, $options: "i" };
    }
    if (filters.currentCourse) {
      query.currentCourse = { $regex: filters.currentCourse, $options: "i" };
    }
    if (filters.department) {
      query.department = { $regex: filters.department, $options: "i" };
    }
    if (filters.semester) {
      query.semester = { $regex: filters.semester, $options: "i" };
    }
    if (filters.admissionNumber) {
      query.admissionNumber = {
        $regex: filters.admissionNumber,
        $options: "i",
      };
    }
    if (filters.govtIdNumber) {
      query.govtIdNumber = { $regex: filters.govtIdNumber, $options: "i" };
    }

    // Boolean filters
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Date range filters
    if (filters.dateOfBirthFrom || filters.dateOfBirthTo) {
      query.dateOfBirth = {};
      if (filters.dateOfBirthFrom) {
        query.dateOfBirth.$gte = new Date(filters.dateOfBirthFrom);
      }
      if (filters.dateOfBirthTo) {
        query.dateOfBirth.$lte = new Date(filters.dateOfBirthTo);
      }
    }

    if (filters.joiningDateFrom || filters.joiningDateTo) {
      query.joiningDate = {};
      if (filters.joiningDateFrom) {
        query.joiningDate.$gte = new Date(filters.joiningDateFrom);
      }
      if (filters.joiningDateTo) {
        query.joiningDate.$lte = new Date(filters.joiningDateTo);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const students = await Student.find(query)
      .populate("institutionId", "orgName email")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total: number = await Student.countDocuments(query);

    const response: ApiResponse<typeof students> = {
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in organization student search:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to perform search",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET - Get search suggestions/autocomplete for organization students
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken(request);

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }
    await connectToDB();

    const { id: organizationId } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      const invalidIdResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid organization ID format",
      };
      return NextResponse.json(invalidIdResponse, { status: 400 });
    }

    // Verify organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      const notFoundResponse: ApiResponse<never> = {
        success: false,
        error: "Organization not found",
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!field || !query) {
      const badRequestResponse: ApiResponse<never> = {
        success: false,
        error: "Field and query parameters are required",
      };
      return NextResponse.json(badRequestResponse, { status: 400 });
    }

    // Define searchable fields
    const searchableFields = [
      "fullName",
      "state",
      "district",
      "county",
      "currentCourse",
      "department",
      "semester",
    ];

    if (!searchableFields.includes(field)) {
      const invalidFieldResponse: ApiResponse<never> = {
        success: false,
        error: `Invalid field. Searchable fields: ${searchableFields.join(
          ", "
        )}`,
      };
      return NextResponse.json(invalidFieldResponse, { status: 400 });
    }

    // Get distinct values that match the query for this organization
    const suggestions = await Student.distinct(field, {
      institutionId: organizationId,
      [field]: { $regex: query, $options: "i" },
      isActive: true,
    });

    // Limit and sort suggestions
    const limitedSuggestions = suggestions
      .filter(
        (suggestion) =>
          suggestion &&
          suggestion.toString().toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .sort();

    const successResponse: ApiResponse<string[]> = {
      success: true,
      data: limitedSuggestions,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching organization search suggestions:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Failed to fetch search suggestions",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
