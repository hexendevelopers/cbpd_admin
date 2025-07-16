import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import Admin from "@/models/adminModel";
import Organization from "@/models/institutionModel";
import Student from "@/models/studentModel";
import { verifyAdminToken } from "@/lib/verifyToken";

export async function GET(request: NextRequest) {
  try {
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    // Get basic counts
    const totalInstitutions = await Organization.countDocuments();
    const approvedInstitutions = await Organization.countDocuments({ isApproved: true });
    const pendingInstitutions = await Organization.countDocuments({ isApproved: false });
    const terminatedInstitutions = await Organization.countDocuments({ isTerminated: true });
    
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ isActive: true });
    const inactiveStudents = await Student.countDocuments({ isActive: false });
    
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentInstitutions = await Organization.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentStudents = await Student.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get monthly registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyInstitutions = await Organization.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthlyStudents = await Student.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get top institutions by student count
    const topInstitutions = await Student.aggregate([
      {
        $group: {
          _id: "$institutionId",
          studentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "organizations",
          localField: "_id",
          foreignField: "_id",
          as: "institution"
        }
      },
      {
        $unwind: "$institution"
      },
      {
        $project: {
          institutionName: "$institution.orgName",
          studentCount: 1
        }
      },
      {
        $sort: { studentCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Get recent activities
    const recentInstitutionsList = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orgName createdAt isApproved");

    const recentStudentsList = await Student.find()
      .populate("institutionId", "orgName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName createdAt institutionId");

    return NextResponse.json({
      statistics: {
        institutions: {
          total: totalInstitutions,
          approved: approvedInstitutions,
          pending: pendingInstitutions,
          terminated: terminatedInstitutions,
          recent: recentInstitutions,
        },
        students: {
          total: totalStudents,
          active: activeStudents,
          inactive: inactiveStudents,
          recent: recentStudents,
        },
        admins: {
          total: totalAdmins,
          active: activeAdmins,
        },
      },
      trends: {
        monthlyInstitutions,
        monthlyStudents,
      },
      topInstitutions,
      recentActivities: {
        institutions: recentInstitutionsList,
        students: recentStudentsList,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}