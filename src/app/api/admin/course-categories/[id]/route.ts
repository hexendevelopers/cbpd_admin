import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import CourseCategory from "@/models/courseCategoryModel";
import Course from "@/models/courseModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
 
    await connectDB();

    const category = await CourseCategory.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
      message: "Category fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching course category:", error);
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

    await connectDB();

    const body = await request.json();
    const { name, description, isActive } = body;

    // Check if category exists
    const existingCategory = await CourseCategory.findById(params.id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if name is being changed and if it already exists
    if (name && name.toLowerCase() !== existingCategory.name.toLowerCase()) {
      const duplicateCategory = await CourseCategory.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: params.id }
      });
      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Category name already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const category = await CourseCategory.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      category,
      message: "Category updated successfully"
    });

  } catch (error) {
    console.error("Error updating course category:", error);
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


    await connectDB();

    // Check if category exists
    const category = await CourseCategory.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has courses
    const coursesCount = await Course.countDocuments({ categoryId: params.id });
    if (coursesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It has ${coursesCount} course(s) associated with it.` },
        { status: 400 }
      );
    }

    await CourseCategory.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course category:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}