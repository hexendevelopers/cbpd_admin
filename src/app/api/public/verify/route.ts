import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/configs/mongodb";
import StudentCertificate from "@/models/studentCertificateModel";
import Student from "@/models/studentModel";
import Center from "@/models/centerModel";
import Membership from "@/models/membershipModel";
import { verificationTemplates, calculateRemainingDays } from "@/utils/verificationTemplates";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json(
        { error: "Verification type and payload are required." },
        { status: 400 }
      );
    }

    switch (type) {
      case "certificate": {
        // Build exact query based on provided fields
        const query: any = {};
        if (payload.regNumber) query.regNumber = payload.regNumber;
        if (payload.certNumber) query.certNumber = payload.certNumber;
        if (payload.learnerNumber) query.learnerNumber = payload.learnerNumber;
        if (payload.name) query.name = payload.name; // optional, but good for exact match if provided

        if (Object.keys(query).length === 0) {
          return NextResponse.json(
            { error: "At least one search parameter is required." },
            { status: 400 }
          );
        }

        const certRecord = await StudentCertificate.findOne(query);

        if (!certRecord) {
          return NextResponse.json({
            status: "NotFound",
            report: verificationTemplates.certificate.notFound
          });
        }

        // Secondary lookup in Student model to check active status
        const studentRecord = await Student.findOne({ certificateNumber: certRecord.certNumber });
        
        // If student exists but is inactive, return invalid
        if (studentRecord && !studentRecord.isActive) {
          return NextResponse.json({
            status: "Invalid",
            report: verificationTemplates.certificate.invalid
          });
        }

        return NextResponse.json({
          status: "Confirmed",
          report: verificationTemplates.certificate.confirmed,
          data: {
            name: certRecord.name,
            regNumber: certRecord.regNumber,
            certNumber: certRecord.certNumber,
            learnerNumber: certRecord.learnerNumber,
            dateVerified: new Date().toISOString()
          }
        });
      }

      case "centre": {
        const { centreCode } = payload;
        if (!centreCode) {
          return NextResponse.json(
            { error: "Centre Code is required for centre verification." },
            { status: 400 }
          );
        }

        const centreRecord = await Center.findOne({ centreCode });

        if (!centreRecord) {
          return NextResponse.json({
            status: "NotFound",
            report: verificationTemplates.certificate.notFound // Reusing not found format
          });
        }

        if (!centreRecord.isActive) {
           return NextResponse.json({
            status: "Invalid",
            report: verificationTemplates.certificate.invalid
          });
        }

        const remainingValidity = calculateRemainingDays(centreRecord.expiryDate);

        return NextResponse.json({
          status: "Confirmed",
          report: verificationTemplates.centre.confirmed,
          data: {
            approvedCentreName: centreRecord.nameOfAffiliatedCentre,
            centreCode: centreRecord.centreCode,
            registeredAddress: centreRecord.location,
            approvalStatus: "Active",
            approvalValidUntil: centreRecord.expiryDate,
            remainingValidity: `${remainingValidity} Days`
          }
        });
      }

      case "membership": {
        const { membershipNumber } = payload;
        if (!membershipNumber) {
          return NextResponse.json(
            { error: "Membership Number is required for membership verification." },
            { status: 400 }
          );
        }

        const membershipRecord = await Membership.findOne({ membershipNumber });

        if (!membershipRecord) {
          return NextResponse.json({
            status: "NotFound",
            report: verificationTemplates.certificate.notFound
          });
        }

        if (!membershipRecord.isActive || membershipRecord.membershipStatus !== "Active") {
          return NextResponse.json({
            status: "Invalid",
            report: verificationTemplates.certificate.invalid
          });
        }

        const remainingValidity = calculateRemainingDays(membershipRecord.validityPeriod.endDate);

        return NextResponse.json({
          status: "Confirmed",
          report: verificationTemplates.membership.confirmed,
          data: {
            memberOrganisation: membershipRecord.membershipName,
            membershipNumber: membershipRecord.membershipNumber,
            membershipCategory: membershipRecord.membershipType,
            status: "Active",
            validFrom: membershipRecord.validityPeriod.startDate,
            validUntil: membershipRecord.validityPeriod.endDate,
            remainingValidity: `${remainingValidity} Days`,
            validityStatus: "Valid"
          }
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid verification type. Must be 'certificate', 'centre', or 'membership'." },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in verification API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
