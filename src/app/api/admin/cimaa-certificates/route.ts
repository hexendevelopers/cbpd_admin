export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import CimaaCertificate from "@/models/CimaaCertificate";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const query: any = {};
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { certificateNo: { $regex: search, $options: "i" } },
        { registrationNo: { $regex: search, $options: "i" } },
        { programName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      CimaaCertificate.find(query).sort({ [sortBy]: order }).skip(skip).limit(limit),
      CimaaCertificate.countDocuments(query),
    ]);

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching CIMAA certificates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    if (!body.studentName || !body.certificateNo || !body.registrationNo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingCert = await CimaaCertificate.findOne({ certificateNo: body.certificateNo });

    if (existingCert) {
      return NextResponse.json({ error: "A certificate with this Certificate Number already exists" }, { status: 400 });
    }

    const newCertificate = new CimaaCertificate(body);
    await newCertificate.save();

    return NextResponse.json({ message: "Certificate saved successfully", certificate: newCertificate }, { status: 201 });
  } catch (error) {
    console.error("Error creating CIMAA certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
