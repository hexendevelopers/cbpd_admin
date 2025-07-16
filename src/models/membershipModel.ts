import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  membershipName: {
    type: String,
    required: true,
    trim: true
  },
  membershipNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['Individual', 'Corporate', 'Student', 'Senior', 'Premium', 'Basic'],
    default: 'Individual'
  },
  membershipStatus: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Suspended', 'Expired', 'Pending'],
    default: 'Active'
  },
  validityPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
membershipSchema.index({ membershipNumber: 1 });
membershipSchema.index({ membershipType: 1 });
membershipSchema.index({ membershipStatus: 1 });
membershipSchema.index({ membershipName: 'text' });

const Membership = mongoose.models.Membership || mongoose.model('Membership', membershipSchema);

export default Membership;