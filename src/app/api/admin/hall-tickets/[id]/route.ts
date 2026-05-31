import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/configs/mongodb";
import HallTicket from "@/models/hallTicketModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function DELETE(
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

    await connectMongoDB();
    const { id } = params;

    const deleted = await HallTicket.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Hall ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Hall ticket deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting hall ticket:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
