import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import CertificateRequest from "@/models/certificateRequestModel";
import mongoose from "mongoose";
import { verifyAdminToken } from "@/lib/verifyToken";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// PUT - Update certificate request status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    // Only admins can update the status
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { status: "Failed", message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    await connectToDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid request ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["Pending", "Processing", "Completed", "Rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedRequest = await CertificateRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: "Certificate request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update certificate request" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a certificate request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { status: "Failed", message: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    await connectToDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid request ID format" },
        { status: 400 }
      );
    }

    const deletedRequest = await CertificateRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return NextResponse.json(
        { success: false, error: "Certificate request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Certificate request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate request" },
      { status: 500 }
    );
  }
}
