// app/api/organizations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import mongoose from "mongoose";

import { verifyInstitutionToken } from "@/lib/verifyToken";

interface RouteParams {
  params: {
    id: string;
  };
}

interface OrganizationUpdateData {
  email?: string;
  emailAddress?: string;
  password?: string;
  [key: string]: any;
}

// GET - Fetch single organization
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const authResult = await verifyInstitutionToken(req);

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }
    await connectToDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    const organization = await Organization.findById(id).select("-password");

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PUT - Update organization
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // const authResult = await protectOrg(request);

    // if (authResult.error) {
    //   return NextResponse.json(
    //     { status: "Failed", message: authResult.error },
    //     { status: authResult.status }
    //   );
    // }

    // if (!authResult.org) {
    //   return NextResponse.json(
    //     { status: "Failed", message: "org not found" },
    //     { status: 404 }
    //   );
    // }
    await connectToDB();

    const { id } = params;
    const body: OrganizationUpdateData = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    // Don't allow password updates through this endpoint
    if (body.password) {
      delete body.password;
    }

    // Check if email is being updated and if it conflicts with existing org
    if (body.email || body.emailAddress) {
      const existingOrg = await Organization.findOne({
        _id: { $ne: id },
        $or: [{ email: body.email }, { emailAddress: body.emailAddress }],
      });

      if (existingOrg) {
        return NextResponse.json(
          {
            success: false,
            error: "Organization with this email already exists",
          },
          { status: 409 }
        );
      }
    }

    const organization = await Organization.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
      message: "Organization updated successfully",
    });
  } catch (error) {
    console.error("Error updating organization:", error);

    if (error instanceof Error && error.name === "ValidationError") {
      const validationError = error as mongoose.Error.ValidationError;
      const errors = Object.values(validationError.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE - Delete organization
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
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

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
