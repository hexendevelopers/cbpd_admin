import mongoose from 'mongoose';

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
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
  icon: {
    type: String,
    required: false,
    trim: true
  },
  image: {
    type: String,
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  cbpdDescription: {
    type: String,
    required: false
  },
  longDescription: {
    type: String,
    required: false
  },
  overviewDescription: {
    type: String,
    required: false
  },
  overviewItems: [{
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  whyChooseUs: {
    type: String,
    required: false
  },
  benefits: [{
    type: String
  }],
  howToEnroll: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for better search performance
courseCategorySchema.index({ name: 'text', description: 'text', slug: 'text' });

const CourseCategory = mongoose.models.CourseCategory || mongoose.model('CourseCategory', courseCategorySchema);

export default CourseCategory;