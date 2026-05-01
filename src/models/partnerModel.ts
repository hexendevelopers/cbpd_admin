import mongoose from "mongoose";

if (mongoose.models.Partner) {
  delete mongoose.models.Partner;
}

const partnerSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    website: { type: String, required: true, trim: true },
    authorizedSignatory: { type: String, required: true, trim: true },
    yearOfInception: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    cityState: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    instituteProfile: { type: String, required: true },
    hasAccreditations: { type: String, enum: ["Yes", "No"], required: true },
    status: {
      type: String,
      enum: ["New", "Reviewed", "Contacted"],
      default: "New",
    },
  },
  { timestamps: true }
);

partnerSchema.index({ email: 1 });
partnerSchema.index({ status: 1 });

const Partner = mongoose.models.Partner || mongoose.model("Partner", partnerSchema);
export default Partner;
