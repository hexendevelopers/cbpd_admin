import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
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
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["super_admin", "admin", "moderator"],
      default: "admin",
    },
    permissions: {
      institutions: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        approve: { type: Boolean, default: false },
      },
      students: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: true },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      admins: {
        create: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.role === 'super_admin') {
    this.permissions = {
      institutions: { create: true, read: true, update: true, delete: true, approve: true },
      students: { create: true, read: true, update: true, delete: true },
      admins: { create: true, read: true, update: true, delete: true },
    };
  } else if (this.role === 'admin') {
    this.permissions = {
      institutions: { create: false, read: true, update: true, delete: false, approve: true },
      students: { create: true, read: true, update: true, delete: false },
      admins: { create: false, read: false, update: false, delete: false },
    };
  } else if (this.role === 'moderator') {
    this.permissions = {
      institutions: { create: false, read: true, update: false, delete: false, approve: false },
      students: { create: false, read: true, update: false, delete: false },
      admins: { create: false, read: false, update: false, delete: false },
    };
  }
  next();
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;