export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/configs/mongodb";
import Course from "@/models/courseModel";
import CourseCategory from "@/models/courseCategoryModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {


    await connectDB();

    const course = await Course.findById(params.id).populate('categoryId', 'name');
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      course,
      message: "Course fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching course:", error);
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
    const { title, description, image, categoryId, isActive, slug, overview, curriculum, jobMarket } = body;

    // Check if course exists
    const existingCourse = await Course.findById(params.id);
    if (!existingCourse) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // If categoryId is being updated, check if it exists
    if (categoryId && categoryId !== existingCourse.categoryId.toString()) {
      const category = await CourseCategory.findById(categoryId);
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category selected" },
          { status: 400 }
        );
      }
    }

    if (slug) {
      const existingSlug = await Course.findOne({
        slug: slug.trim(),
        _id: { $ne: params.id }
      });
      if (existingSlug) {
        return NextResponse.json(
          { error: "Course slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (slug !== undefined) updateData.slug = slug.trim();
    if (overview !== undefined) updateData.overview = overview;
    if (curriculum !== undefined) updateData.curriculum = curriculum;
    if (jobMarket !== undefined) updateData.jobMarket = jobMarket;
    if (image !== undefined) updateData.image = image;
    if (categoryId) updateData.categoryId = categoryId;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const course = await Course.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('categoryId', 'name');

    return NextResponse.json({
      course,
      message: "Course updated successfully"
    });

  } catch (error) {
    console.error("Error updating course:", error);
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

    const course = await Course.findByIdAndDelete(params.id);
    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}