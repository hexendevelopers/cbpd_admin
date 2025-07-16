import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/configs/mongodb";
import Course from "@/models/courseModel";
import CourseCategory from "@/models/courseCategoryModel";

export async function GET(request: NextRequest) {
  try {


    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query)
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    return NextResponse.json({
      courses,
      pagination,
      message: "Courses fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching courses:", error);
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
    const { title, description, image, categoryId } = body;

    // Validate required fields
    if (!title || !description || !categoryId) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await CourseCategory.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Invalid category selected" },
        { status: 400 }
      );
    }

    const course = new Course({
      title,
      description,
      image: image || null,
      categoryId
    });

    await course.save();

    // Populate category for response
    const populatedCourse = await Course.findById(course._id).populate('categoryId', 'name');

    return NextResponse.json({
      course: populatedCourse,
      message: "Course created successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {

    await connectDB();

    const body = await request.json();
    const { courseIds, action } = body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: "Course IDs are required" },
        { status: 400 }
      );
    }

    let updateData: any = {};
    
    switch (action) {
      case "activate":
        updateData = { isActive: true };
        break;
      case "deactivate":
        updateData = { isActive: false };
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    await Course.updateMany(
      { _id: { $in: courseIds } },
      updateData
    );

    return NextResponse.json({
      message: `Courses ${action}d successfully`
    });

  } catch (error) {
    console.error("Error updating courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}