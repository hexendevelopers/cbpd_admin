import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import QuestionPaper from "@/models/questionPaperModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function POST(req: NextRequest) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const data = await req.json();

    const newQuestionPaper = await QuestionPaper.create(data);
    return NextResponse.json(newQuestionPaper, { status: 201 });
  } catch (error: any) {
    console.error("Error saving question paper:", error);
    return NextResponse.json({ error: error.message || "Failed to save question paper" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const questionPapers = await QuestionPaper.find().sort({ createdAt: -1 });
    return NextResponse.json(questionPapers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching question papers:", error);
    return NextResponse.json({ error: "Failed to fetch question papers" }, { status: 500 });
  }
}
