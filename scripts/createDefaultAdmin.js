const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Admin schema (copied from model)
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ["super_admin", "admin", "moderator"], default: "admin" },
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
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

// Set default permissions based on role
adminSchema.pre('save', function(next) {
  if (this.role === 'super_admin') {
    this.permissions = {
      institutions: { create: true, read: true, update: true, delete: true, approve: true },
      students: { create: true, read: true, update: true, delete: true },
      admins: { create: true, read: true, update: true, delete: true },
    };
  }
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cbpd_admin');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@cbpd.com' });
    if (existingAdmin) {
      console.log('Default admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create default admin
    const defaultAdmin = new Admin({
      username: 'admin',
      email: 'admin@cbpd.com',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: 'super_admin',
    });

    await defaultAdmin.save();
    console.log('Default admin created successfully');
    console.log('Email: admin@cbpd.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createDefaultAdmin();