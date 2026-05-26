import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import CertificateRequest from "@/models/certificateRequestModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { status: "Failed", message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectToDB();

    const requests = await CertificateRequest.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate request" },
      { status: 500 }
    );
  }
}
