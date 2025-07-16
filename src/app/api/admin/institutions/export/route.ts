import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/configs/mongodb";
import Institution from "@/models/institutionModel";

export async function GET(request: NextRequest) {
  try {
    // const tokenResult = await verifyToken(request);
    // if (!tokenResult.valid) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const format = searchParams.get("format") || "csv"; // csv or excel

    // Build query with same filters as main institutions API
    const query: any = {};
    
    if (search) {
      query.$or = [
        { orgName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { businessAddress: { $regex: search, $options: "i" } }
      ];
    }

    if (status === "approved") {
      query.isApproved = true;
    } else if (status === "pending") {
      query.isApproved = false;
    } else if (status === "terminated") {
      query.isTerminated = true;
    }

    // Fetch all institutions matching the filter (no pagination for export)
    const institutions = await Institution.find(query)
      .sort({ createdAt: -1 })
      .select('-password'); // Exclude password field

    // Prepare comprehensive data for export
    const exportData = institutions.map((institution, index) => ({
      // Basic Information
      'S.No': index + 1,
      'Organization Name': institution.orgName,
      'Industry Sector': institution.industrySector || 'N/A',
      'Organization Email': institution.email,
      'Main Telephone': institution.mainTelephone || 'N/A',
      'Website': institution.website || 'N/A',
      
      // Address Information
      'Business Address': institution.businessAddress || 'N/A',
      'Postal Code': institution.postalCode || 'N/A',
      'Full Address': `${institution.businessAddress || ''}, ${institution.postalCode || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'N/A',
      
      // Primary Contact Person
      'Contact Person Name': `${institution.firstName || ''} ${institution.lastName || ''}`.trim() || 'N/A',
      'Contact First Name': institution.firstName || 'N/A',
      'Contact Last Name': institution.lastName || 'N/A',
      'Contact Job Title': institution.jobTitle || 'N/A',
      'Contact Email': institution.emailAddress || 'N/A',
      'Contact Phone': institution.phoneNumber || 'N/A',
      'Contact Mobile': institution.mobileNumber || 'N/A',
      
      // Secondary Contact Person
      'Secondary Contact Name': (institution.SfirstName || institution.SlastName) ? 
        `${institution.SfirstName || ''} ${institution.SlastName || ''}`.trim() : 'N/A',
      'Secondary First Name': institution.SfirstName || 'N/A',
      'Secondary Last Name': institution.SlastName || 'N/A',
      'Secondary Job Title': institution.SjobTitle || 'N/A',
      'Secondary Email': institution.SemailAddress || 'N/A',
      'Secondary Phone': institution.SphoneNumber || 'N/A',
      'Secondary Mobile': institution.SmobileNumber || 'N/A',
      
      // Status Information
      'Status': institution.isTerminated ? 'Terminated' : (institution.isApproved ? 'Approved' : 'Pending'),
      'Is Approved': institution.isApproved ? 'Yes' : 'No',
      'Is Terminated': institution.isTerminated ? 'Yes' : 'No',
      
      // Dates
      'Created Date': new Date(institution.createdAt).toLocaleDateString(),
      'Updated Date': new Date(institution.updatedAt).toLocaleDateString(),
      'Created Time': new Date(institution.createdAt).toLocaleString(),
      'Updated Time': new Date(institution.updatedAt).toLocaleString(),
      
      // Additional Information
      'Days Since Registration': Math.floor((new Date().getTime() - new Date(institution.createdAt).getTime()) / (1000 * 3600 * 24)),
      'Registration Year': new Date(institution.createdAt).getFullYear(),
      'Registration Month': new Date(institution.createdAt).toLocaleDateString('en-US', { month: 'long' }),
    }));

    if (format === "excel") {
      // For Excel format, we'll return JSON data that frontend can convert to Excel
      return NextResponse.json({
        data: exportData,
        filename: `institutions_export_${new Date().toISOString().split('T')[0]}.xlsx`,
        message: "Export data prepared successfully"
      });
    } else {
      // For CSV format, convert to CSV string
      if (exportData.length === 0) {
        return NextResponse.json({
          error: "No data found to export"
        }, { status: 404 });
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="institutions_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

  } catch (error) {
    console.error("Error exporting institutions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}