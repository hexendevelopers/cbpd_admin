import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import CimaaCertificate from "@/models/CimaaCertificate";
import { verifyAdminToken } from "@/lib/verifyToken";

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
    const { id } = params;

    const deletedCertificate = await CimaaCertificate.findByIdAndDelete(id);

    if (!deletedCertificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting CIMAA certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
