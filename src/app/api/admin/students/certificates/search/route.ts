import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentName = searchParams.get("studentName") || "";
    const registerNumber = searchParams.get("registerNumber") || "";
    const certificateNumber = searchParams.get("certificateNumber") || "";
    const learnerNumber = searchParams.get("learnerNumber") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build search query
    const query: any = {};

    // Search by student name (partial match, case insensitive)
    if (studentName) {
      query.fullName = { $regex: studentName, $options: "i" };
    }

    // Search by register number (exact match, case insensitive)
    if (registerNumber) {
      query.registerNumber = { $regex: `^${registerNumber}$`, $options: "i" };
    }

    // Search by certificate number (exact match, case insensitive)
    if (certificateNumber) {
      query.certificateNumber = { $regex: `^${certificateNumber}$`, $options: "i" };
    }

    // Search by learner number (exact match, case insensitive)
    if (learnerNumber) {
      query.learnerNumber = { $regex: `^${learnerNumber}$`, $options: "i" };
    }

    const skip = (page - 1) * limit;

    // Execute search with pagination
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(query),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      students,
      pagination,
      searchCriteria: {
        studentName,
        registerNumber,
        certificateNumber,
        learnerNumber,
      },
      message: "Student certificates search completed successfully",
    });
  } catch (error) {
    console.error("Error searching student certificates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { searchTerms } = body;

    if (!searchTerms || (!searchTerms.studentName && !searchTerms.registerNumber && !searchTerms.certificateNumber && !searchTerms.learnerNumber)) {
      return NextResponse.json(
        { error: "Please provide at least one search criteria" },
        { status: 400 }
      );
    }

    // Build advanced search query
    const query: any = {};

    if (searchTerms.studentName) {
      query.fullName = {
        $regex: searchTerms.studentName,
        $options: "i",
      };
    } 
    
    if (searchTerms.registerNumber) {
      query.registerNumber = {
        $regex: `^${searchTerms.registerNumber}$`,
        $options: "i",
      };
    }

    if (searchTerms.certificateNumber) {
      query.certificateNumber = {
        $regex: `^${searchTerms.certificateNumber}$`,
        $options: "i",
      };
    }

    if (searchTerms.learnerNumber) {
      query.learnerNumber = {
        $regex: `^${searchTerms.learnerNumber}$`,
        $options: "i",
      };
    }

    // Execute search
    const students = await Student.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      students,
      searchTerms,
      totalFound: students.length,
      message: "Advanced student certificates search completed successfully",
    });
  } catch (error) {
    console.error("Error in advanced student certificates search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
