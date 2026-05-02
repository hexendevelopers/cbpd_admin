export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import StudentCertificate from "@/models/studentCertificateModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const certificate = await StudentCertificate.findById(params.id);

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Check for uniqueness of regNumber and certNumber if they are being updated
    if (body.regNumber || body.certNumber) {
      const existingCert = await StudentCertificate.findOne({
        _id: { $ne: params.id },
        $or: [
          ...(body.regNumber ? [{ regNumber: body.regNumber }] : []),
          ...(body.certNumber ? [{ certNumber: body.certNumber }] : [])
        ]
      });

      if (existingCert) {
        return NextResponse.json({ error: "Another certificate with this Registration Number or Certificate Number already exists" }, { status: 400 });
      }
    }

    const updatedCertificate = await StudentCertificate.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Certificate updated successfully", certificate: updatedCertificate });
  } catch (error) {
    console.error("Error updating certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const deletedCertificate = await StudentCertificate.findByIdAndDelete(params.id);

    if (!deletedCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
