import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import { hashPassword } from "@/lib/hashing";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// POST - Reset password using token
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Token, password, and confirm password are required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (password !== confirmPassword) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Passwords do not match",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (password.length < 6) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Password must be at least 6 characters long",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find institution with valid reset token
    const institution = await Organization.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    });

    if (!institution) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid or expired reset token",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if institution is approved
    if (!institution.isApproved) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Account is not approved. Please contact support.",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if institution is terminated
    if (institution.isTerminated) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Account has been terminated. Please contact support.",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Hash new password
    const hashedPassword = hashPassword(password);

    // Update password and clear reset token
    await Organization.findByIdAndUpdate(institution._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    const successResponse: ApiResponse<never> = {
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Internal server error. Please try again later.",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET - Verify reset token validity
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Reset token is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find institution with valid reset token
    const institution = await Organization.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    }).select("orgName firstName lastName");

    if (!institution) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Invalid or expired reset token",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check if institution is approved
    if (!institution.isApproved) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Account is not approved",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if institution is terminated
    if (institution.isTerminated) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Account has been terminated",
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    const successResponse: ApiResponse<any> = {
      success: true,
      data: {
        institutionName: institution.orgName,
        contactName: `${institution.firstName} ${institution.lastName}`,
      },
      message: "Reset token is valid",
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Verify reset token error:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}