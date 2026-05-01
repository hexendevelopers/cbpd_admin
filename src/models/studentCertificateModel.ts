import mongoose from "mongoose";

if (mongoose.models.StudentCertificate) {
  delete mongoose.models.StudentCertificate;
}

const studentCertificateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    regNumber: { type: String, required: true, trim: true },
    certNumber: { type: String, required: true, trim: true },
    learnerNumber: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

studentCertificateSchema.index({ regNumber: 1 });
studentCertificateSchema.index({ certNumber: 1 });

const StudentCertificate = mongoose.models.StudentCertificate || mongoose.model("StudentCertificate", studentCertificateSchema);
export default StudentCertificate;
