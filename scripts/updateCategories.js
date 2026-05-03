import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable inside .env");
}

const courseCategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  cbpdDescription: String,
  longDescription: String,
  overviewDescription: String,
  overviewItems: [{ title: String, description: String }],
  whyChooseUs: String,
  benefits: [String],
  howToEnroll: [String],
  icon: String,
  image: String,
  isActive: Boolean,
});

const CourseCategory = mongoose.models.CourseCategory || mongoose.model("CourseCategory", courseCategorySchema);

const defaultWhyChooseUs = `CBPD delivers shorter, more practical, and highly flexible credentials when compared with many traditional, rigid academic qualifications.\n\nOur dynamic programmes seamlessly combine esteemed UK professional standards with modern, in-demand skills. This unique fusion helps ambitious professionals and forward-thinking organisations achieve faster time-to-value and highly measurable, sustainable results.`;

const defaultBenefits = [
  "Practical, job-focused learning with immediate workplace application.",
  "Flexible delivery modes to suit busy professionals and organisations.",
  "Prestigious UK-issued CBPD certification recognised internationally.",
  "Clear pathways for career progression and further CBPD qualifications.",
  "Delivered exclusively through quality-assured CBPD authorised partners."
];

const defaultSteps = [
  "Select the CBPD programme that best matches your goals.",
  "Contact or enrol through an authorised CBPD partner (online or in your region).",
  "Complete the focused learning and practical assessment.",
  "Receive your official CBPD digital certificate with unique verification."
];

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const categories = await CourseCategory.find({});
    console.log(`Found ${categories.length} categories to update.`);

    for (const category of categories) {
      console.log(`Updating category: ${category.name}`);

      category.cbpdDescription = `The Central Board of Professional Development (CBPD) offers a comprehensive range of practical ${category.name} designed to accelerate career growth and enhance business performance, efficiency, and sustainable growth.`;
      
      category.longDescription = `CBPD ${category.name} certifications focus on real-world application, strategic thinking, leadership, and operational excellence — helping individuals advance their careers faster.`;
      
      category.overviewDescription = `CBPD provides targeted, high-impact programmes across vital disciplines. Each programme is tailored for busy professionals and delivers immediately measurable workplace results.`;
      
      category.whyChooseUs = defaultWhyChooseUs;
      category.benefits = defaultBenefits;
      category.howToEnroll = defaultSteps;

      // Keep overviewItems empty so they can add it manually in admin portal,
      // since overviewItems are specific to each category.

      await category.save();
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

run();
