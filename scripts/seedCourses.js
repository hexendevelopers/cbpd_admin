const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI");
  process.exit(1);
}

const jobMarketInsightsMap = {
  "business": {
    description: "Business Management professionals play a critical role in organisational growth and strategic decision-making. Globally recognised qualifications enhance leadership capabilities and improve career progression opportunities.",
    salaryRange: "£35,000 - £90,000+ / $50,000 - $150,000+",
    growthRate: "Steady growth across leadership and management roles",
    topEmployers: ["Multinational corporations", "Consulting firms", "Financial institutions", "SMEs"]
  },
  "information-technology": {
    description: "The IT sector remains one of the fastest-growing industries worldwide. Skilled professionals in software, cybersecurity, and systems management are in high demand.",
    salaryRange: "£35,000 - £100,000+ / $60,000 - $150,000+",
    growthRate: "+15% (faster than average across technology roles)",
    topEmployers: ["Technology companies", "Global enterprises", "Fintech firms", "Startups"]
  },
  "design": {
    description: "The demand for skilled professionals in UI/UX and Digital Design continues to grow rapidly as organisations prioritise user-centric digital experiences. Certification in this field provides a strong competitive advantage and is highly valued across global markets.",
    salaryRange: "£30,000 - £80,000+ / $40,000 - $130,000+",
    growthRate: "+14% (faster than average across digital roles)",
    topEmployers: ["Global technology firms", "Digital agencies", "E-commerce companies", "High-growth startups"]
  },
  "education": {
    description: "The education sector continues to grow globally, with increasing demand for qualified educators and trainers. Professional certification enhances teaching standards and career opportunities.",
    salaryRange: "£24,000 - £55,000+ / $30,000 - $80,000+",
    growthRate: "Steady demand across early childhood and professional training sectors",
    topEmployers: ["Schools", "Training institutes", "Education centres", "International academies"]
  },
  "technical": {
    description: "The UK faces a significant shortage of qualified technical tradespeople, making this a highly secure and lucrative sector. Certified technicians are in constant demand for residential, commercial, and infrastructure projects.",
    salaryRange: "£28,000 – £55,000+",
    growthRate: "Strong, continuous demand driven by national housing targets and infrastructure upgrades",
    topEmployers: ["Construction firms", "Facilities management companies", "Local councils", "Independent contractors"]
  },
  "engineering": {
    description: "Engineering remains a cornerstone of the UK economy, with critical shortages in civil, electrical, and mechanical fields. Professional certification accelerates career progression.",
    salaryRange: "£32,000 – £80,000+",
    growthRate: "Steady growth, especially in automation, robotics, and sustainable engineering",
    topEmployers: ["Aerospace companies", "Automotive manufacturers", "Civil engineering consultancies", "Technology firms"]
  },
  "construction": {
    description: "The UK construction sector is expanding with major infrastructure projects and housing developments. Qualified site managers, quantity surveyors, and safety officers are critical to project delivery.",
    salaryRange: "£35,000 – £85,000+",
    growthRate: "Consistent growth driven by government infrastructure spending",
    topEmployers: ["Major construction contractors", "Civil engineering firms", "Property developers", "Government agencies"]
  },
  "energy": {
    description: "The transition to green energy has created a massive skills gap in the UK. Professionals certified in renewable energy systems, smart grids, and sustainable practices are highly sought after.",
    salaryRange: "£35,000 – £90,000+",
    growthRate: "+15% (Exponential growth aligned with Net Zero targets)",
    topEmployers: ["Energy providers", "Offshore wind developers", "Sustainability consultancies", "Oil & gas transitioning firms"]
  },
  "finance": {
    description: "Accounting and finance professionals are essential to business operations and financial planning. Globally recognised certifications enhance career stability and growth opportunities.",
    salaryRange: "£30,000 - £85,000+ / $50,000 - $140,000+",
    growthRate: "Stable demand across all industries",
    topEmployers: ["Banks", "Audit firms", "Corporate organisations", "Financial institutions"]
  },
  "healthcare-medical": {
    description: "The healthcare sector continues to expand globally, with increasing demand for qualified professionals in patient care and support services. Certification enhances employability and professional credibility.",
    salaryRange: "£25,000 - £60,000+ / $35,000 - $90,000+",
    growthRate: "High demand driven by ageing populations and healthcare expansion",
    topEmployers: ["Hospitals", "Clinics", "Care homes", "Healthcare organisations"]
  },
  "fire-safety": {
    description: "Following updated UK building safety regulations, the demand for certified fire safety and risk assessment professionals has skyrocketed to ensure compliance and protect lives.",
    salaryRange: "£30,000 – £70,000+",
    growthRate: "High demand driven by strict regulatory changes and compliance mandates",
    topEmployers: ["Local authorities", "Property management firms", "Health & safety consultancies", "Major corporations"]
  },
  "human-resources": {
    description: "HR professionals are essential for managing talent, compliance, and organizational culture. Certified HR practitioners gain credibility and faster paths to leadership roles.",
    salaryRange: "£28,000 – £80,000+",
    growthRate: "Steady demand, particularly in talent acquisition and employee wellbeing",
    topEmployers: ["Corporate enterprises", "Public sector organizations", "Recruitment agencies", "Technology startups"]
  },
  "hospitality": {
    description: "The hospitality and tourism sector is a major global industry, offering diverse career opportunities. Professional qualifications enhance service standards and career progression.",
    salaryRange: "£22,000 - £60,000+ / $30,000 - $90,000+",
    growthRate: "Steady growth with global travel and tourism recovery",
    topEmployers: ["Hotels", "Resorts", "Airlines", "Cruise lines", "Tourism companies"]
  },
  "science": {
    description: "The UK is a global leader in scientific research and biotechnology. Certified laboratory technicians and data analysts are vital to driving innovation and clinical advancements.",
    salaryRange: "£26,000 – £65,000+",
    growthRate: "Steady growth fueled by pharmaceutical developments and environmental research",
    topEmployers: ["Pharmaceutical companies", "Academic research institutes", "Healthcare providers", "Environmental agencies"]
  },
  "media": {
    description: "The digital media landscape requires versatile professionals skilled in content creation, journalism, and broadcasting. Certification provides a distinct edge in a highly competitive market.",
    salaryRange: "£25,000 – £60,000+",
    growthRate: "Rapid growth in digital content creation and streaming platforms",
    topEmployers: ["Broadcasters", "Digital marketing agencies", "Publishing houses", "Media production startups"]
  },
  "marine": {
    description: "The maritime sector is essential for global trade. Certified marine engineers and logistics professionals ensure efficient port operations and maritime safety worldwide.",
    salaryRange: "£32,000 – £85,000+",
    growthRate: "Stable demand driven by international shipping and offshore energy developments",
    topEmployers: ["Shipping lines", "Port authorities", "Offshore energy operators", "Maritime logistics firms"]
  },
  "international": {
    description: "In a globalized economy, professionals who understand cross-cultural management and international commerce are invaluable for business expansion and global supply chains.",
    salaryRange: "£35,000 – £95,000+",
    growthRate: "Strong growth as companies continue to expand into emerging global markets",
    topEmployers: ["Multinational corporations", "International trade organizations", "NGOs", "Global management consultancies"]
  },
  "beauty-wellness": {
    description: "The beauty and wellness industry is expanding rapidly, driven by global demand for personal care and aesthetic services. Certified professionals gain a strong competitive advantage.",
    salaryRange: "£20,000 - £70,000+ / $30,000 - $100,000+",
    growthRate: "Strong growth driven by consumer demand and lifestyle trends",
    topEmployers: ["Salons", "Wellness centres", "Cosmetic clinics", "Independent businesses"]
  },
  "property-real-estate": {
    description: "The dynamic UK property market requires skilled professionals in valuation, facility management, and real estate investment to maximize asset performance.",
    salaryRange: "£25,000 – £80,000+",
    growthRate: "Steady demand driven by commercial real estate recovery and residential development",
    topEmployers: ["Real estate agencies", "Property management firms", "Investment funds", "Corporate facilities departments"]
  },
  "transport-logistics": {
    description: "With global trade expansion, logistics and supply chain professionals are in high demand. Certification provides the skills needed for efficient operations and global coordination.",
    salaryRange: "£30,000 - £80,000+ / $45,000 - $120,000+",
    growthRate: "Growing demand driven by e-commerce and global supply networks",
    topEmployers: ["Logistics firms", "Manufacturing companies", "Retail giants", "Global distributors"]
  },
  "travel-tourism": {
    description: "The hospitality and tourism sector is a major global industry, offering diverse career opportunities. Professional qualifications enhance service standards and career progression.",
    salaryRange: "£22,000 - £60,000+ / $30,000 - $90,000+",
    growthRate: "Steady growth with global travel and tourism recovery",
    topEmployers: ["Hotels", "Resorts", "Airlines", "Tourism companies", "Travel agencies"]
  },
  "telecommunications": {
    description: "The rollout of 5G and fiber-optic networks has created a surge in demand for certified telecommunications engineers and network managers to build next-generation connectivity.",
    salaryRange: "£30,000 – £75,000+",
    growthRate: "High demand driven by digital infrastructure upgrades and 5G expansion",
    topEmployers: ["Telecom operators", "Internet service providers", "Network infrastructure firms", "Tech giants"]
  },
  "sport": {
    description: "The health and wellness boom has led to increased demand for certified sports coaches, nutritionists, and fitness managers. Professional qualifications are essential for credibility.",
    salaryRange: "£22,000 – £55,000+",
    growthRate: "Strong, steady growth driven by public health awareness and professional sports expansion",
    topEmployers: ["Leisure centers", "Professional sports clubs", "Private health clubs", "Independent coaching"]
  },
  "social-care": {
    description: "The UK's aging population and increased focus on mental health have made social care one of the most critical sectors. Certified professionals ensure high-quality care and leadership.",
    salaryRange: "£24,000 – £55,000+",
    growthRate: "Very high demand driven by demographic shifts and social care requirements",
    topEmployers: ["Local authorities", "Private care homes", "NHS trusts", "Specialized care charities"]
  },
  "security": {
    description: "As physical and digital threats evolve, qualified security professionals are essential for protecting corporate assets, data, and personnel globally.",
    salaryRange: "£28,000 – £75,000+",
    growthRate: "Strong growth driven by increased corporate risk, cybersecurity integration, and asset protection",
    topEmployers: ["Private security firms", "Corporate enterprises", "Government agencies", "Risk management consultancies"]
  }
};

const rawData = [
  { title: "Business Programmes", slug: "business", icon: "💼", image: "https://muhammedjasir908.github.io/cbpd/images/external/1552664730-d307ca884978.jpg", subs: ["MBA Essentials", "Corporate Strategy & Leadership", "Business Ethics", "Organizational Behavior", "Entrepreneurship Fundamentals"] },
  { title: "Information Technology Programmes", slug: "information-technology", icon: "💻", image: "https://muhammedjasir908.github.io/cbpd/images/external/1550751827-4bd374c3f58b.jpg", subs: ["Data Science", "Artificial Intelligence", "Cyber Security", "Digital Marketing", "Software Development", "Web and App Development"] },
  { title: "Design Programmes", slug: "design", icon: "🎨", image: "https://muhammedjasir908.github.io/cbpd/images/external/1561070791-2526d30994b5.jpg", subs: ["Graphic Design", "Interior Design", "UI/UX & Digital Design", "Animation & Motion Graphics", "Fashion & Textile Design"] },
  { title: "Education Programmes", slug: "education", icon: "🎓", image: "https://muhammedjasir908.github.io/cbpd/images/external/1509062522246-3755977927d7.jpg", subs: ["Montessori Teaching Methods", "Early Years Education", "Inclusive Education & SEN", "Educational Leadership", "Digital Teaching & Online Learning"] },
  { title: "Technical Programmes", slug: "technical", icon: "🔧", image: "https://muhammedjasir908.github.io/cbpd/images/external/1581092580497-e0d23cbdf1dc.jpg", subs: ["Mobile Phone Technician", "AC/Fridge Technician", "Electrical Technician", "Plumbing & Heating", "Automotive Technician"] },
  { title: "Engineering Programmes", slug: "engineering", icon: "⚙️", image: "https://muhammedjasir908.github.io/cbpd/images/external/1581092160562-40aa08e78837.jpg", subs: ["Mechanical Engineering", "Electrical & Electronic", "Civil Engineering", "Project Management for Engineers", "Automation & Control"] },
  { title: "Construction Programmes", slug: "construction", icon: "🏗️", image: "https://muhammedjasir908.github.io/cbpd/_next/static/media/construction.b89ebc11.png", subs: ["Construction Project Management", "Health & Safety in Construction", "Quantity Surveying", "BIM Awareness", "Civil Engineering Site Practices"] },
  { title: "Energy Programmes", slug: "energy", icon: "⚡", image: "https://muhammedjasir908.github.io/cbpd/images/external/1466611653911-95081537e5b7.jpg", subs: ["Renewable Energy Systems", "Solar & Wind Technology", "Oil & Gas Operations", "Sustainable Energy", "Smart Grids & Digital Energy"] },
  { title: "Finance Programmes", slug: "finance", icon: "📈", image: "https://muhammedjasir908.github.io/cbpd/images/external/1554224155-8d04cb21cd6c.jpg", subs: ["Accounting & Bookkeeping", "Financial Management", "Corporate Finance", "Risk Management", "FinTech & Digital Finance"] },
  { title: "Healthcare & Medical Programmes", slug: "healthcare-medical", icon: "🏥", image: "https://muhammedjasir908.github.io/cbpd/images/external/1516549655169-df83a0774514.jpg", subs: ["Medical Lab Technology", "Nursing & Dialysis", "Radiology & Imaging", "Hospital Administration", "Healthcare Safety"] },
  { title: "Fire & Safety Programmes", slug: "fire-safety", icon: "🧯", image: "https://muhammedjasir908.github.io/cbpd/_next/static/media/fire-safety.35c7e0c4.png", subs: ["Fire Safety Management", "Risk Assessment", "Fire Prevention Systems", "Emergency Planning", "Fire Safety Engineering"] },
  { title: "Human Resources Programmes", slug: "human-resources", icon: "👥", image: "https://muhammedjasir908.github.io/cbpd/images/external/1522071820081-009f0129c71c.jpg", subs: ["Human Resource Management", "Talent Acquisition", "Learning & Development", "Performance Management", "Employee Relations"] },
  { title: "Hospitality Programmes", slug: "hospitality", icon: "🏨", image: "https://muhammedjasir908.github.io/cbpd/images/external/1566073771259-6a8506099945.jpg", subs: ["Hospitality Management", "Hotel Operations", "Food & Beverage", "Culinary Arts", "Event Management"] },
  { title: "Science Programmes", slug: "science", icon: "🔬", image: "https://muhammedjasir908.github.io/cbpd/images/external/1532094349884-543bc11b234d.jpg", subs: ["Laboratory Techniques", "Research Methods", "Analytical Chemistry", "Microbiology & Biotechnology", "Data Analysis for Scientists"] },
  { title: "Media Programmes", slug: "media", icon: "🎥", image: "https://muhammedjasir908.github.io/cbpd/images/external/1478720568477-152d9b164e26.jpg", subs: ["Digital Media Production", "Journalism & News Reporting", "Content Creation & Strategy", "Broadcasting & Television", "Social Media Management"] },
  { title: "Marine Programmes", slug: "marine", icon: "⚓", image: "https://muhammedjasir908.github.io/cbpd/_next/static/media/marine.3de1f8fc.png", subs: ["Maritime Operations", "Marine Engineering", "Port & Harbour Management", "Maritime Safety & Survival", "Maritime Logistics"] },
  { title: "International Programmes", slug: "international", icon: "🌍", image: "https://muhammedjasir908.github.io/cbpd/images/external/1521295121783-8a321d551ad2.jpg", subs: ["International Business", "Cross-Cultural Management", "Global Commerce", "International Relations", "Global Supply Chain"] },
  { title: "Beauty & Wellness Programmes", slug: "beauty-wellness", icon: "✨", image: "https://muhammedjasir908.github.io/cbpd/images/external/1560066984-138dadb4c035.jpg", subs: ["Beauty Therapy", "Advanced Beauty Therapy & Aesthetics", "Makeup Artistry & Special Effects", "Hairdressing & Barbering Techniques", "Spa & Wellness Therapy"] },
  { title: "Property Programmes", slug: "property-real-estate", icon: "🏢", image: "https://muhammedjasir908.github.io/cbpd/images/external/1486406146926-c627a92ad1ab.jpg", subs: ["Property Management", "Real Estate Valuation", "Agency & Sales", "Investment & Finance", "Facilities Management"] },
  { title: "Transport Programmes", slug: "transport-logistics", icon: "🚛", image: "https://muhammedjasir908.github.io/cbpd/_next/static/media/transport.dbfcf5a6.png", subs: ["Transport Management", "Airline Management", "Aviation Management", "Logistics & Supply Chain", "Road Transport & Fleet"] },
  { title: "Tourism Programmes", slug: "travel-tourism", icon: "✈️", image: "https://muhammedjasir908.github.io/cbpd/images/external/1436491865332-7a61a109cc05.jpg", subs: ["Tourism Management", "Travel Agency Operations", "Tour Operations & Guiding", "Destination Management", "Sustainable Tourism Practices"] },
  { title: "Telecommunications Programmes", slug: "telecommunications", icon: "📡", image: "https://muhammedjasir908.github.io/cbpd/images/external/1544465544-1b71aee9dfa3.jpg", subs: ["Telecommunications Fundamentals", "5G & Next-Generation Networks", "Fibre Optic Technology", "Wireless Communications", "Network Management"] },
  { title: "Sport Programmes", slug: "sport", icon: "🏅", image: "https://muhammedjasir908.github.io/cbpd/images/external/1517836357463-d25dfeac3438.jpg", subs: ["Sports Coaching", "Fitness Instruction", "Gym Management", "Sports Nutrition", "Sports Psychology"] },
  { title: "Social Care Programmes", slug: "social-care", icon: "🤝", image: "https://muhammedjasir908.github.io/cbpd/images/external/1576765608535-5f04d1e3f289.jpg", subs: ["Safeguarding Adults", "Dementia Care", "Mental Health Awareness", "Elderly Care", "Social Care Leadership"] },
  { title: "Security Programmes", slug: "security", icon: "🛡️", image: "https://muhammedjasir908.github.io/cbpd/_next/static/media/security.8b73fdb8.png", subs: ["Security Management", "Asset Protection", "Risk Assessment", "Cybersecurity", "Close Protection"] }
];

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true }
});
const CourseCategory = mongoose.models.CourseCategory || mongoose.model('CourseCategory', categorySchema);

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  overview: { type: String },
  curriculum: [{ type: String }],
  jobMarket: {
    salaryRange: { type: String },
    growthRate: { type: String },
    topEmployers: [{ type: String }],
    description: { type: String }
  },
  image: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseCategory', required: true },
  isActive: { type: Boolean, default: true }
});
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

const generateSlug = (str) => str.toLowerCase().replace(/ & | /g, "-").replace(/[^a-z0-9-]/g, "");

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    await CourseCategory.deleteMany({});
    await Course.deleteMany({});
    console.log("Cleared existing categories and courses.");

    for (const catData of rawData) {
      const insight = jobMarketInsightsMap[catData.slug] || {
        salaryRange: "£30,000 - £80,000+",
        growthRate: "Steady Growth",
        topEmployers: ["Leading UK Companies", "Global Enterprises", "SMEs"],
        description: `The demand for specialized expertise is reaching an all-time high.`
      };

      const category = new CourseCategory({
        name: catData.title,
        slug: catData.slug,
        description: insight.description,
        icon: catData.icon,
        image: catData.image
      });

      const savedCategory = await category.save();
      console.log(`Created Category: ${savedCategory.name}`);

      for (const subTitle of catData.subs) {
        let subSlug = generateSlug(subTitle);
        
        let existing = await Course.findOne({ slug: subSlug });
        let counter = 1;
        while (existing) {
          subSlug = `${generateSlug(subTitle)}-${counter}`;
          existing = await Course.findOne({ slug: subSlug });
          counter++;
        }
        
        const course = new Course({
          title: subTitle,
          slug: subSlug,
          description: `Master the principles of ${subTitle} with our globally accredited industry curriculum.`,
          overview: `Our rigorous ${subTitle} curriculum provides a definitive path to commanding ${catData.title.replace('Programmes', '').trim().toLowerCase()} principles in the modern industry landscape. You will gain profound insights designed and validated by senior experts.`,
          curriculum: [
            "Foundational Principles & Core Concepts",
            "Advanced Strategies & Applied Methodologies",
            "Industry Case Studies & Scenario Planning",
            "Final Practicum Project & Assessment",
          ],
          jobMarket: {
            salaryRange: insight.salaryRange,
            growthRate: insight.growthRate,
            topEmployers: insight.topEmployers,
            description: insight.description
          },
          image: catData.image, // Giving the subcourse the category's image as default
          categoryId: savedCategory._id
        });

        await course.save();
        console.log(`  Created Course: ${course.title}`);
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
