import { NextResponse } from "next/server";
import { comparePassword } from "@/lib/hashing";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import { generateToken } from "@/lib/generateToken";

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: "Failed", message: "Email and password are required" },
        { status: 400 }
      );
    }
    await connectToDB();

    const org = await Organization.findOne({
      email: email.toLowerCase(),
      isApproved: true,
    });

    if (!org) {
      return NextResponse.json(
        { status: "Failed", message: "You are not Approved by CBPD board" },
        { status: 401 }
      );
    }

    const isPasswordValid = comparePassword(password, org.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "Failed", message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Remove sensitive data before sending response
    const orgData = org.toObject();
    delete orgData.password;

    const token = generateToken({ id: orgData._id });

    const response = NextResponse.json(
      {
        status: "Success",
        message: "Login successful",
        org: orgData,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "authToken",
      value: token,
      httpOnly: true,
      sameSite: "lax", // Changed from "strict" to "lax" to allow cross-origin requests
      secure: process.env.NODE_ENV === "production", // Only secure in production
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.log("Error in Organization login:", error);
    return NextResponse.json(
      { status: "Failed", message: error.message },
      { status: 500 }
    );
  }
};
