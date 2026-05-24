import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/configs/mongodb";
import Invoice from "@/models/invoiceModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    
    if (!adminData) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    await connectMongoDB();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    let query: any = {};
    if (status) {
      query.status = status;
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ invoices }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    
    if (!adminData) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();

    await connectMongoDB();

    const newInvoice = new Invoice(data);
    await newInvoice.save();

    return NextResponse.json(
      { message: "Invoice saved successfully", invoice: newInvoice },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving invoice:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
