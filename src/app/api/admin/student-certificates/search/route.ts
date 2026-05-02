export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import StudentCertificate from "@/models/studentCertificateModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get("studentName") || "";
    const regNumber = searchParams.get("regNumber") || "";
    const certNumber = searchParams.get("certNumber") || "";
    const learnerNumber = searchParams.get("learnerNumber") || "";

    // Build search query
    const query: any = {};

    if (studentName) {
      query.name = { $regex: studentName, $options: "i" };
    }
    if (regNumber) {
      query.regNumber = { $regex: `^${regNumber}$`, $options: "i" };
    }
    if (certNumber) {
      query.certNumber = { $regex: `^${certNumber}$`, $options: "i" };
    }
    if (learnerNumber) {
      query.learnerNumber = { $regex: `^${learnerNumber}$`, $options: "i" };
    }

    const certificates = await StudentCertificate.find(query).limit(10);

    return NextResponse.json({
      certificates,
      message: "Student certificates search completed",
    });
  } catch (error) {
    console.error("Error searching student certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
