import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import { EmailService } from "@/lib/emailService";
import { TokenUtils } from "@/lib/tokenUtils";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// POST - Send password reset email
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectToDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: "Email is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find institution by email (check both email and emailAddress fields)
    const institution = await Organization.findOne({
      $or: [
        { email: email.toLowerCase() },
        { emailAddress: email.toLowerCase() }
      ],
    });

    // Always return success to prevent email enumeration attacks
    const successResponse: ApiResponse<never> = {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    if (!institution) {
      // Don't reveal that the email doesn't exist
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Check if institution is approved
    if (!institution.isApproved) {
      // Don't reveal that the account is not approved
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Check if institution is terminated
    if (institution.isTerminated) {
      // Don't reveal that the account is terminated
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Generate reset token
    const { token: resetToken, expiry: resetTokenExpiry } = TokenUtils.generateTokenWithExpiry(1); // 1 hour

    // Update institution with reset token
    await Organization.findByIdAndUpdate(institution._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    });

    // Send password reset email
    try {
      const contactName = `${institution.firstName} ${institution.lastName}`;
      await EmailService.sendPasswordReset(
        institution.emailAddress,
        institution.orgName,
        contactName,
        resetToken
      );
      console.log('Password reset email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Clear the reset token if email fails
      await Organization.findByIdAndUpdate(institution._id, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      const emailErrorResponse: ApiResponse<never> = {
        success: false,
        error: "Failed to send password reset email. Please try again later.",
      };
      return NextResponse.json(emailErrorResponse, { status: 500 });
    }

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    const errorResponse: ApiResponse<never> = {
      success: false,
      error: "Internal server error. Please try again later.",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}