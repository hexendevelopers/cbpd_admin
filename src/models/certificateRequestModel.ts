import mongoose from "mongoose";

if (mongoose.models.CertificateRequest) {
  delete mongoose.models.CertificateRequest;
}

const certificateRequestSchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    instituteName: {
      type: String,
      required: true,
      trim: true,
    },
    programmeName: {
      type: String,
      required: true,
      trim: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfLearners: {
      type: Number,
      required: true,
      min: 1,
    },
    examCompletedDate: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const CertificateRequest =
  mongoose.models.CertificateRequest ||
  mongoose.model("CertificateRequest", certificateRequestSchema);

export default CertificateRequest;
