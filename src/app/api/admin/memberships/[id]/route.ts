import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Membership from "@/models/membershipModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const membership = await Membership.findById(params.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      membership,
      message: "Membership fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const body = await request.json();
    const { 
      membershipName, 
      membershipNumber, 
      membershipType, 
      membershipStatus,
      validityPeriod,
      isActive 
    } = body;

    // Check if membership exists
    const existingMembership = await Membership.findById(params.id);
    if (!existingMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Check if membership number is being changed and if it already exists
    if (membershipNumber && membershipNumber.toUpperCase() !== existingMembership.membershipNumber) {
      const duplicateMembership = await Membership.findOne({ 
        membershipNumber: membershipNumber.toUpperCase(),
        _id: { $ne: params.id }
      });
      if (duplicateMembership) {
        return NextResponse.json(
          { error: "Membership number already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (membershipName) updateData.membershipName = membershipName;
    if (membershipNumber) updateData.membershipNumber = membershipNumber.toUpperCase();
    if (membershipType) updateData.membershipType = membershipType;
    if (membershipStatus) updateData.membershipStatus = membershipStatus;
    if (validityPeriod) {
      updateData.validityPeriod = {
        startDate: new Date(validityPeriod.startDate),
        endDate: new Date(validityPeriod.endDate)
      };
    }
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const membership = await Membership.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      membership,
      message: "Membership updated successfully"
    });

  } catch (error) {
    console.error("Error updating membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const membership = await Membership.findByIdAndDelete(params.id);
    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Membership deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}