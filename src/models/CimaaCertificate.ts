import mongoose from "mongoose";

const cimaaCertificateSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    programName: { type: String, required: true },
    providerName: { type: String, required: true },
    certificateNo: { type: String, required: true, unique: true },
    registrationNo: { type: String, required: true },
    dateIssued: { type: Date, required: true },
    pdfUrl: { type: String },
  },
  { timestamps: true }
);

const CimaaCertificate =
  mongoose.models.CimaaCertificate || mongoose.model("CimaaCertificate", cimaaCertificateSchema);

export default CimaaCertificate;
