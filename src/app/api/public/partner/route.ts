export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Partner from "@/models/partnerModel";

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
    const requiredFields = [
      "organizationName", 
      "website", 
      "authorizedSignatory", 
      "yearOfInception", 
      "addressLine1", 
      "cityState", 
      "country", 
      "email", 
      "phone", 
      "instituteProfile", 
      "hasAccreditations"
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    const newPartner = new Partner({
      organizationName: body.organizationName,
      website: body.website,
      authorizedSignatory: body.authorizedSignatory,
      yearOfInception: body.yearOfInception,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2 || "",
      cityState: body.cityState,
      country: body.country,
      email: body.email,
      phone: body.phone,
      instituteProfile: body.instituteProfile,
      hasAccreditations: body.hasAccreditations,
      status: "New",
    });

    await newPartner.save();

    return NextResponse.json(
      { message: "Partnership enquiry submitted successfully", data: newPartner },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Partner Form Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
