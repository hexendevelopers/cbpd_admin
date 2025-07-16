import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
courseCategorySchema.index({ name: 'text', description: 'text' });

const CourseCategory = mongoose.models.CourseCategory || mongoose.model('CourseCategory', courseCategorySchema);

export default CourseCategory;