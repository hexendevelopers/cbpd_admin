import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from "@/configs/mongodb";
import HallTicket from "@/models/hallTicketModel";
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

    const hallTickets = await HallTicket.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ hallTickets }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching hall tickets:", error);
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

    const newHallTicket = new HallTicket(data);
    await newHallTicket.save();

    return NextResponse.json(
      { message: "Hall ticket saved successfully", hallTicket: newHallTicket },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving hall ticket:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
