import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import QuestionPaper from "@/models/questionPaperModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const questionPaper = await QuestionPaper.findById(params.id);
    
    if (!questionPaper) {
      return NextResponse.json({ error: "Question Paper not found" }, { status: 404 });
    }

    return NextResponse.json(questionPaper, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching question paper:", error);
    return NextResponse.json({ error: "Failed to fetch question paper" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminData = await verifyAdminToken(req);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();
    const deletedQuestionPaper = await QuestionPaper.findByIdAndDelete(params.id);
    
    if (!deletedQuestionPaper) {
      return NextResponse.json({ error: "Question Paper not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Question Paper deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting question paper:", error);
    return NextResponse.json({ error: "Failed to delete question paper" }, { status: 500 });
  }
}
