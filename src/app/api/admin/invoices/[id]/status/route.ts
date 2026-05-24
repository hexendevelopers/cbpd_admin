import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/configs/mongodb";
import Invoice from "@/models/invoiceModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { status } = data;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!updatedInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Status updated successfully", invoice: updatedInvoice },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating invoice status:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
