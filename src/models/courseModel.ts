import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  overview: {
    type: String,
    required: false,
    trim: true
  },
  curriculum: [{
    type: String
  }],
  jobMarket: {
    salaryRange: { type: String, required: false },
    growthRate: { type: String, required: false },
    topEmployers: [{ type: String }],
    description: { type: String, required: false }
  },
  image: {
    type: String,
    required: false,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseCategory',
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
courseSchema.index({ title: 'text', description: 'text', slug: 'text', overview: 'text' });
courseSchema.index({ categoryId: 1 });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;