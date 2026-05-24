import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/configs/mongodb";
import Invoice from "@/models/invoiceModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { message: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Invoice deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete invoice error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
