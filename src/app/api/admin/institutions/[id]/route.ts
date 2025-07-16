import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";
import Student from "@/models/studentModel";
import { verifyAdminToken } from "@/lib/verifyToken";
import { EmailService } from "@/lib/emailService";

// GET - Get single institution details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const institution = await Organization.findById(params.id).select(
      "-password"
    );

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Get student statistics
    const totalStudents = await Student.countDocuments({
      institutionId: params.id,
    });
    const activeStudents = await Student.countDocuments({
      institutionId: params.id,
      isActive: true,
    });

    // Get recent students
    const recentStudents = await Student.find({ institutionId: params.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName createdAt isActive");

    // Get department-wise student count
    const departmentStats = await Student.aggregate([
      { $match: { institutionId: institution._id } },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      institution: institution.toObject(),
      statistics: {
        totalStudents,
        activeStudents,
        inactiveStudents: totalStudents - activeStudents,
        departmentStats,
      },
      recentStudents,
    });
  } catch (error) {
    console.error("Get institution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update institution data or status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || !adminData.permissions?.institutions?.update) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const requestData = await request.json();
    const { action } = requestData;

    // Get current institution data to check previous approval status
    const currentInstitution = await Organization.findById(params.id);
    if (!currentInstitution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    let updateData: any = {};
    let message = "";
    let shouldSendApprovalEmail = false;

    if (action) {
      // Handle status actions
      if (action === "approve") {
        updateData = { isApproved: true, isTerminated: false };
        message = `Institution ${action}d successfully`;
        // Send approval email only if institution wasn't previously approved
        shouldSendApprovalEmail = !currentInstitution.isApproved;
      } else if (action === "terminate") {
        updateData = { isTerminated: true, isApproved: false };
        message = `Institution ${action}d successfully`;
      } else if (action === "reactivate") {
        updateData = { isTerminated: false, isApproved : true };
        message = `Institution ${action}d successfully`;
        // Send approval email only if institution wasn't previously approved
        shouldSendApprovalEmail = !currentInstitution.isApproved;
      } else {
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
      }
    } else {
      // Handle full data update
      updateData = { ...requestData };
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.password;
      message = "Institution updated successfully";
    }

    const institution = await Organization.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    // Send approval email if needed
    if (shouldSendApprovalEmail) {
      try {
        const contactName = `${institution.firstName} ${institution.lastName}`;
        await EmailService.sendApprovalNotification(
          institution.emailAddress,
          institution.orgName,
          contactName,
          institution.email
        );
        console.log('Approval notification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send approval notification email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    return NextResponse.json({
      message,
      institution,
    });
  } catch (error) {
    console.error("Update institution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete institution (super_admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData || adminData.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Check if institution has students
    const studentCount = await Student.countDocuments({
      institutionId: params.id,
    });

    if (studentCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete institution with existing students" },
        { status: 400 }
      );
    }

    const institution = await Organization.findByIdAndDelete(params.id);

    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Institution deleted successfully",
    });
  } catch (error) {
    console.error("Delete institution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
