import connectToDB from "@/configs/mongodb";
import Course from "@/models/courseModel";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();
    const response = await Course.find();
    if (response.length === 0) {
      return NextResponse.json(
        { message: "No courses found" },
        { status: 404 }
      );
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Error fetching courses", error: error.message },
      { status: 500 }
    );
  }
};
