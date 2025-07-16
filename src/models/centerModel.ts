import mongoose from 'mongoose';

const centerSchema = new mongoose.Schema({
  centreCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  nameOfAffiliatedCentre: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
centerSchema.index({ centreCode: 1 });
centerSchema.index({ location: 1 });
centerSchema.index({ nameOfAffiliatedCentre: 'text' });

const Center = mongoose.models.Center || mongoose.model('Center', centerSchema);

export default Center;