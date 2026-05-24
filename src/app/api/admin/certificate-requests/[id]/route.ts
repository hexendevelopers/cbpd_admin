import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import CertificateRequest from "@/models/certificateRequestModel";
import { verifyAdminToken } from "@/lib/verifyToken";
import Organization from "@/models/institutionModel";
import { EmailService } from "@/lib/emailService";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { status: "Failed", message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDB();

    const body = await request.json();
    const { status, adminReply } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
    }

    const updatedRequest = await CertificateRequest.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { success: false, error: "Certificate request not found" },
        { status: 404 }
      );
    }

    // Fetch the institution to get the email address
    const institution = await Organization.findById(updatedRequest.institutionId);

    if (institution && institution.email) {
      if (status === "Under Review") {
        await EmailService.sendCertificateUnderReview(
          institution.email,
          institution.orgName || updatedRequest.instituteName
        );
      } else if (status === "Approved") {
        await EmailService.sendCertificateApproved(
          institution.email,
          institution.orgName || updatedRequest.instituteName,
          updatedRequest.batchNumber
        );
      } else if (status === "Rejected") {
        await EmailService.sendCertificateRejected(
          institution.email,
          institution.orgName || updatedRequest.instituteName,
          updatedRequest.batchNumber
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { status: "Failed", message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDB();

    const deletedRequest = await CertificateRequest.findByIdAndDelete(params.id);

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
