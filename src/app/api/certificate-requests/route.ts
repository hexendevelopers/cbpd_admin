import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import CertificateRequest from "@/models/certificateRequestModel";
import { protectOrg } from "@/lib/verifyToken";
import mongoose from "mongoose";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// POST - Create a new certificate request
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await protectOrg();

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();

    const body = await request.json();
    const {
      institutionId,
      instituteName,
      programmeName,
      batchNumber,
      numberOfLearners,
      examCompletedDate,
      batchStartDate,
      message,
    } = body;

    // Validate required fields
    if (
      !institutionId ||
      !instituteName ||
      !programmeName ||
      !batchNumber ||
      !numberOfLearners ||
      !examCompletedDate ||
      !batchStartDate
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRequest = new CertificateRequest({
      institutionId,
      instituteName,
      programmeName,
      batchNumber,
      numberOfLearners: Number(numberOfLearners),
      examCompletedDate: new Date(examCompletedDate),
      batchStartDate: new Date(batchStartDate),
      message,
    });

    await newRequest.save();

    return NextResponse.json({
      success: true,
      message: "Certificate request submitted successfully",
      data: newRequest,
    });
  } catch (error: any) {
    console.error("Error creating certificate request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certificate request" },
      { status: 500 }
    );
  }
}

// GET - Get certificate request (optionally filtered by institutionId)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await protectOrg();

    if (authResult.error) {
      return NextResponse.json(
        { status: "Failed", message: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();

    const searchParams = request.nextUrl.searchParams;
    const institutionId = searchParams.get("institutionId");

    const query: any = {};
    if (institutionId) {
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        return NextResponse.json(
          { success: false, error: "Invalid institution ID format" },
          { status: 400 }
        );
      }
      query.institutionId = new mongoose.Types.ObjectId(institutionId);
    }

    const requests = await CertificateRequest.find(query).sort({ createdAt: -1 });

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
