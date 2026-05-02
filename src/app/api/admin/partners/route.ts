export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Partner from "@/models/partnerModel";
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
    const status = searchParams.get("status") || "";

    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [partners, total] = await Promise.all([
      Partner.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Partner.countDocuments(query),
    ]);

    return NextResponse.json({
      partners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
