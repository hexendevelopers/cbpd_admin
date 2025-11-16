import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Student from "@/models/studentModel";

export async function GET(request: NextRequest) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const institutionId = searchParams.get("institutionId") || "";
    const status = searchParams.get("status") || "";
    const department = searchParams.get("department") || "";
    const course = searchParams.get("course") || "";
    const semester = searchParams.get("semester") || "";
    const gender = searchParams.get("gender") || "";
    const format = searchParams.get("format") || "csv"; // csv or excel

    // Build query with same filters as main students API
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { admissionNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (institutionId) {
      query.institutionId = institutionId;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (department) {
      query.department = { $regex: department, $options: "i" };
    }

    if (course) {
      query.currentCourse = { $regex: course, $options: "i" };
    }

    if (semester) {
      query.semester = { $regex: semester, $options: "i" };
    }

    if (gender) {
      query.gender = gender;
    }

    // Fetch all students matching the filter with complete institution data
    const students = await Student.find(query)
      .populate("institutionId") // Populate complete institution data
      .sort({ createdAt: -1 });

    // Prepare comprehensive data for export
    const exportData = students.map((student, index) => ({
      // Basic Information
      "S.No": index + 1,
      "Admission Number": student.admissionNumber || "N/A",
      "Full Name": student.fullName,
      Gender: student.gender || "N/A",
      "Phone Number": student.phoneNumber || "N/A",
      "Date of Birth": student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : "N/A",
      "Joining Date": student.joiningDate
        ? new Date(student.joiningDate).toLocaleDateString()
        : "N/A",

      // Address Information
      State: student.state || "N/A",
      District: student.district || "N/A",
      County: student.county || "N/A",
      "Full Address":
        `${student.state || ""}, ${student.district || ""}, ${
          student.county || ""
        }`
          .replace(/^,\s*|,\s*$/g, "")
          .replace(/,\s*,/g, ",") || "N/A",

      // Academic Information
      "Current Course": student.currentCourse || "N/A",
      Department: student.department || "N/A",
      Semester: student.semester || "N/A",

      // Institution Information
      "Institution Name": student.institutionId?.orgName || "N/A",
      "Institution Email": student.institutionId?.email || "N/A",
      "Institution Phone": student.institutionId?.mainTelephone || "N/A",
      "Institution Address": student.institutionId?.businessAddress || "N/A",
      "Institution Postal Code": student.institutionId?.postalCode || "N/A",
      "Institution Website": student.institutionId?.website || "N/A",
      "Industry Sector": student.institutionId?.industrySector || "N/A",

      // Institution Contact Person
      "Contact Person": student.institutionId
        ? `${student.institutionId.firstName || ""} ${
            student.institutionId.lastName || ""
          }`.trim()
        : "N/A",
      "Contact Job Title": student.institutionId?.jobTitle || "N/A",
      "Contact Email": student.institutionId?.emailAddress || "N/A",
      "Contact Phone": student.institutionId?.phoneNumber || "N/A",
      "Contact Mobile": student.institutionId?.mobileNumber || "N/A",

      // Secondary Contact (if available)
      "Secondary Contact":
        student.institutionId &&
        (student.institutionId.SfirstName || student.institutionId.SlastName)
          ? `${student.institutionId.SfirstName || ""} ${
              student.institutionId.SlastName || ""
            }`.trim()
          : "N/A",
      "Secondary Job Title": student.institutionId?.SjobTitle || "N/A",
      "Secondary Email": student.institutionId?.SemailAddress || "N/A",
      "Secondary Phone": student.institutionId?.SphoneNumber || "N/A",
      "Secondary Mobile": student.institutionId?.SmobileNumber || "N/A",

      // File Information
      "Passport Photo": student.passportPhoto
        ? student.passportPhoto
        : "Not Uploaded",
      "Marksheets Links":
        student.marksheets && student.marksheets.length > 0
          ? student.marksheets.join(" | ")
          : "No Marksheets",
      "Marksheets Status":
        student.marksheets && student.marksheets.length > 0
          ? "Uploaded"
          : "Not Uploaded",

      // Status and Dates
      "Student Status": student.isActive ? "Active" : "Inactive",
      "Institution Status": student.institutionId?.isTerminated
        ? "Terminated"
        : student.institutionId?.isApproved
        ? "Approved"
        : "Pending",
      "Student Created Date": new Date(student.createdAt).toLocaleDateString(),
      "Student Updated Date": new Date(student.updatedAt).toLocaleDateString(),
      "Institution Created Date": student.institutionId?.createdAt
        ? new Date(student.institutionId.createdAt).toLocaleDateString()
        : "N/A",
    }));

    if (format === "excel") {
      // For Excel format, we'll return JSON data that frontend can convert to Excel
      return NextResponse.json({
        data: exportData,
        filename: `students_export_${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
        message: "Export data prepared successfully",
      });
    } else {
      // For CSV format, convert to CSV string
      if (exportData.length === 0) {
        return NextResponse.json(
          {
            error: "No data found to export",
          },
          { status: 404 }
        );
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escape commas and quotes in CSV
              return typeof value === "string" &&
                (value.includes(",") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(",")
        ),
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="students_export_${
            new Date().toISOString().split("T")[0]
          }.csv"`,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
