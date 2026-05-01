import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import StudentCertificate from "@/models/studentCertificateModel";
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
        { name: { $regex: search, $options: "i" } },
        { regNumber: { $regex: search, $options: "i" } },
        { certNumber: { $regex: search, $options: "i" } },
        { learnerNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      StudentCertificate.find(query).sort({ [sortBy]: order }).skip(skip).limit(limit),
      StudentCertificate.countDocuments(query),
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
    console.error("Error fetching student certificates:", error);
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
    
    // Basic validation
    if (!body.name || !body.regNumber || !body.certNumber || !body.learnerNumber) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check for existing records
    const existingCert = await StudentCertificate.findOne({
      $or: [
        { regNumber: body.regNumber },
        { certNumber: body.certNumber }
      ]
    });

    if (existingCert) {
      return NextResponse.json({ error: "A certificate with this Registration Number or Certificate Number already exists" }, { status: 400 });
    }

    const newCertificate = new StudentCertificate(body);
    await newCertificate.save();

    return NextResponse.json({ message: "Certificate created successfully", certificate: newCertificate }, { status: 201 });
  } catch (error) {
    console.error("Error creating student certificate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
