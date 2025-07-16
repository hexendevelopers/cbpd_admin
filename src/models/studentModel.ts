// models/Student.ts
import mongoose from "mongoose";
import "./institutionModel"
// Clear any existing model to avoid caching issues
if (mongoose.models.Student) {
  delete mongoose.models.Student;
}

const studentSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
      enum: ["Male", "Female", "Other"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    // Address Information
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    county: {
      type: String,
      required: [true, "County is required"],
      trim: true,
    },

    // Academic Information
    currentCourse: {
      type: String,
      required: [true, "Current course is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department/Branch is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Year/Semester is required"],
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, "College admission number is required"],
      unique: true,
      trim: true,
    },

    // File Uploads (URLs from Cloudflare R2) - uploaded separately after creation
    marksheets: {
      type: [String], // Array of URLs for multiple marksheet images
      default: [],
      required: false, // Explicitly not required
    },
    passportPhoto: {
      type: String, // Single URL for passport photo image
      default: "", // Optional - uploaded separately after creation
      required: false, // Explicitly not required
    },

    // Status Fields
    isActive: {
      type: Boolean,
      default: true,
    },

    // Institution Reference (required)
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Institution ID is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better performance
studentSchema.index({ fullName: "text" });
studentSchema.index({ isActive: 1 });
studentSchema.index({ institutionId: 1 });
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
