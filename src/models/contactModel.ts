import mongoose from "mongoose";

if (mongoose.models.Contact) {
  delete mongoose.models.Contact;
}

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    enquiryType: { 
      type: String, 
      enum: ["General Enquiry", "Programme Enquiry", "Enquiry", "Programme", "Other"], 
      default: "General Enquiry" 
    },
    programmeName: { type: String, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "Read", "Replied"],
      default: "New",
    },
  },
  { timestamps: true }
);

contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;
