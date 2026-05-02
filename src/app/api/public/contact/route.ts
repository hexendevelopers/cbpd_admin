export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Contact from "@/models/contactModel";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "phone", "message"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const newContact = new Contact({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      enquiryType: body.enquiryType || "General Enquiry",
      programmeName: body.programmeName || "",
      message: body.message,
      status: "New",
    });

    await newContact.save();

    return NextResponse.json(
      { message: "Contact form submitted successfully", data: newContact },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
