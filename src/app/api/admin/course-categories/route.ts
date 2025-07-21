import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import CourseCategory from "@/models/courseCategoryModel";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const all = searchParams.get("all") === "true"; // For dropdown lists

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    // If requesting all categories (for dropdowns), return all active categories
    if (all) {
      const categories = await CourseCategory.find({ isActive: true })
        .sort({ name: 1 })
        .select("_id name");

      return NextResponse.json({
        categories,
        message: "Categories fetched successfully",
      });
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      CourseCategory.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CourseCategory.countDocuments(query),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      categories,
      pagination,
      message: "Categories fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching course categories:", error);
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
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const existingCategory = await CourseCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category name already exists" },
        { status: 400 }
      );
    }

    const category = new CourseCategory({
      name: name.trim(),
      description: description?.trim() || "",
    });

    await category.save();

    return NextResponse.json(
      {
        category,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course category:", error);
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
    const { categoryIds, action } = body;

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Category IDs are required" },
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
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await CourseCategory.updateMany({ _id: { $in: categoryIds } }, updateData);

    return NextResponse.json({
      message: `Categories ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating course categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
