import { NextResponse } from "next/server";
import connectToDB from "@/configs/mongodb";
import Organization from "@/models/institutionModel";

export async function GET() {
  await connectToDB();
  const insts = await Organization.find({ resetPasswordToken: { $ne: null } }).select("orgName isApproved email resetPasswordToken");
  return NextResponse.json(insts);
}
