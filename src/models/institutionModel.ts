// models/Organization.js
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    // Organization Information
    orgName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxlength: [100, "Organization name cannot exceed 100 characters"],
    },
    industrySector: {
      type: String,
      required: [true, "Industry sector is required"],
      trim: true,
    },
    businessAddress: {
      type: String,
      required: [true, "Business address is required"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
    },
    mainTelephone: {
      type: String,
      required: [true, "Main telephone number is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please enter a valid URL",
      },
    },
    email: {
      type: String,
      required: [true, "Organization email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    // Contact Person Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    emailAddress: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },

    // Secondary Contact Person Information
    SfirstName: {
      type: String,
      trim: true,
    },
    SlastName: {
      type: String,
      trim: true,
    },

    SjobTitle: {
      type: String,
      trim: true,
    },

    SemailAddress: {
      type: String,

      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    SphoneNumber: {
      type: String,

      trim: true,
    },
    SmobileNumber: {
      type: String,
      trim: true,
    },

    // Status Fields
    isApproved: {
      type: Boolean,
      default: false,
    },
    isTerminated: {
      type: Boolean,
      default: false,
    },

    // Password Reset Fields
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default Organization;
