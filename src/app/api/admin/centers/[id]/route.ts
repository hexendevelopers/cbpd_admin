import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Center from "@/models/centerModel";

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

    const center = await Center.findById(params.id);
    if (!center) {
      return NextResponse.json(
        { error: "Center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      center,
      message: "Center fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching center:", error);
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
    const { centreCode, location, nameOfAffiliatedCentre, expiryDate, isActive } = body;

    // Check if center exists
    const existingCenter = await Center.findById(params.id);
    if (!existingCenter) {
      return NextResponse.json(
        { error: "Center not found" },
        { status: 404 }
      );
    }

    // Check if centre code is being changed and if it already exists
    if (centreCode && centreCode.toUpperCase() !== existingCenter.centreCode) {
      const duplicateCenter = await Center.findOne({ 
        centreCode: centreCode.toUpperCase(),
        _id: { $ne: params.id }
      });
      if (duplicateCenter) {
        return NextResponse.json(
          { error: "Centre code already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (centreCode) updateData.centreCode = centreCode.toUpperCase();
    if (location) updateData.location = location;
    if (nameOfAffiliatedCentre) updateData.nameOfAffiliatedCentre = nameOfAffiliatedCentre;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const center = await Center.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      center,
      message: "Center updated successfully"
    });

  } catch (error) {
    console.error("Error updating center:", error);
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

    const center = await Center.findByIdAndDelete(params.id);
    if (!center) {
      return NextResponse.json(
        { error: "Center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Center deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting center:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}