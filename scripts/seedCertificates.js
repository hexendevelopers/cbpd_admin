const mongoose = require('mongoose');

const students = [
  { name: "Adithya Ajayan", regNumber: "CBPD/11113", certNumber: "CBPD/ISDME/25/3193", learnerNumber: "CPL5499/089" },
  { name: "Aiswarya K", regNumber: "CBPD/11114", certNumber: "CBPD/ISDME/25/3194", learnerNumber: "CPL5499/090" },
  { name: "Aiswarya M", regNumber: "CBPD/11115", certNumber: "CBPD/ISDME/25/3195", learnerNumber: "CPL5499/091" },
  { name: "Akshara S", regNumber: "CBPD/11116", certNumber: "CBPD/ISDME/25/3196", learnerNumber: "CPL5499/092" },
  { name: "Akshaya Ks", regNumber: "CBPD/11117", certNumber: "CBPD/ISDME/25/3197", learnerNumber: "CPL5499/093" },
  { name: "Ambily Pc", regNumber: "CBPD/11118", certNumber: "CBPD/ISDME/25/3198", learnerNumber: "CPL5499/094" },
  { name: "Anam Kidwai", regNumber: "CBPD/11119", certNumber: "CBPD/ISDME/25/3199", learnerNumber: "CPL5499/095" },
  { name: "Anamika Sajith", regNumber: "CBPD/11120", certNumber: "CBPD/ISDME/25/3200", learnerNumber: "CPL5499/096" },
  { name: "Ansila A", regNumber: "CBPD/11121", certNumber: "CBPD/ISDME/25/3201", learnerNumber: "CPL5499/097" },
  { name: "Ansila M", regNumber: "CBPD/11122", certNumber: "CBPD/ISDME/25/3202", learnerNumber: "CPL5499/098" },
  { name: "Ansiya A", regNumber: "CBPD/11123", certNumber: "CBPD/ISDME/25/3203", learnerNumber: "CPL5499/099" },
  { name: "Aparna Td", regNumber: "CBPD/11124", certNumber: "CBPD/ISDME/25/3204", learnerNumber: "CPL5499/100" },
  { name: "Aswathi Ka", regNumber: "CBPD/11125", certNumber: "CBPD/ISDME/25/3205", learnerNumber: "CPL5499/101" },
  { name: "Aswathy Sugunan", regNumber: "CBPD/11126", certNumber: "CBPD/ISDME/25/3206", learnerNumber: "CPL5499/102" },
  { name: "Athira Shaji S", regNumber: "CBPD/11127", certNumber: "CBPD/ISDME/25/3207", learnerNumber: "CPL5499/103" },
  { name: "Binsha Babu", regNumber: "CBPD/11128", certNumber: "CBPD/ISDME/25/3208", learnerNumber: "CPL5499/104" },
  { name: "Bismi B", regNumber: "CBPD/11129", certNumber: "CBPD/ISDME/25/3209", learnerNumber: "CPL5499/105" },
  { name: "Divya Dineshan", regNumber: "CBPD/11130", certNumber: "CBPD/ISDME/25/3210", learnerNumber: "CPL5499/106" },
  { name: "Farsana Irshad", regNumber: "CBPD/11131", certNumber: "CBPD/ISDME/25/3211", learnerNumber: "CPL5499/107" },
  { name: "Faseelamol Bn", regNumber: "CBPD/11132", certNumber: "CBPD/ISDME/25/3212", learnerNumber: "CPL5499/108" },
  { name: "Fathima", regNumber: "CBPD/11133", certNumber: "CBPD/ISDME/25/3213", learnerNumber: "CPL5499/109" },
  { name: "Gayathri Anilkumar", regNumber: "CBPD/11134", certNumber: "CBPD/ISDME/25/3214", learnerNumber: "CPL5499/110" },
  { name: "Hansiya H", regNumber: "CBPD/11137", certNumber: "CBPD/ISDME/25/3217", learnerNumber: "CPL5499/111" },
  { name: "Irfana S", regNumber: "CBPD/11138", certNumber: "CBPD/ISDME/25/3218", learnerNumber: "CPL5499/112" },
  { name: "Josvin Mariya Antony", regNumber: "CBPD/11139", certNumber: "CBPD/ISDME/25/3219", learnerNumber: "CPL5499/113" },
  { name: "Kajal L", regNumber: "CBPD/11140", certNumber: "CBPD/ISDME/25/3220", learnerNumber: "CPL5499/114" },
  { name: "Khadeeja N", regNumber: "CBPD/11141", certNumber: "CBPD/ISDME/25/3221", learnerNumber: "CPL5499/115" },
  { name: "Lancy Devasia", regNumber: "CBPD/11142", certNumber: "CBPD/ISDME/25/3222", learnerNumber: "CPL5499/116" },
  { name: "Nashida Navas", regNumber: "CBPD/11143", certNumber: "CBPD/ISDME/25/3223", learnerNumber: "CPL5499/117" },
  { name: "Neenu R Krishnan", regNumber: "CBPD/11144", certNumber: "CBPD/ISDME/25/3224", learnerNumber: "CPL5499/118" },
  { name: "Nubina Nazeer", regNumber: "CBPD/11145", certNumber: "CBPD/ISDME/25/3225", learnerNumber: "CPL5499/119" },
  { name: "Praveena Pk", regNumber: "CBPD/11146", certNumber: "CBPD/ISDME/25/3226", learnerNumber: "CPL5499/120" },
  { name: "Resmina R", regNumber: "CBPD/11147", certNumber: "CBPD/ISDME/25/3227", learnerNumber: "CPL5499/121" },
  { name: "Revathy Pv", regNumber: "CBPD/11148", certNumber: "CBPD/ISDME/25/3228", learnerNumber: "CPL5499/122" },
  { name: "Riswana Kabeer", regNumber: "CBPD/11149", certNumber: "CBPD/ISDME/25/3229", learnerNumber: "CPL5499/123" },
  { name: "Ruksana Kabeer", regNumber: "CBPD/11150", certNumber: "CBPD/ISDME/25/3230", learnerNumber: "CPL5499/124" },
  { name: "Sarika S", regNumber: "CBPD/11151", certNumber: "CBPD/ISDME/25/3231", learnerNumber: "CPL5499/125" },
  { name: "Selina Vincent", regNumber: "CBPD/11152", certNumber: "CBPD/ISDME/25/3232", learnerNumber: "CPL5499/126" },
  { name: "Shabna Noushad", regNumber: "CBPD/11153", certNumber: "CBPD/ISDME/25/3233", learnerNumber: "CPL5499/127" },
  { name: "Shadhina S", regNumber: "CBPD/11154", certNumber: "CBPD/ISDME/25/3234", learnerNumber: "CPL5499/128" },
  { name: "Shafna S", regNumber: "CBPD/11155", certNumber: "CBPD/ISDME/25/3235", learnerNumber: "CPL5499/129" },
  { name: "Shalima S", regNumber: "CBPD/11156", certNumber: "CBPD/ISDME/25/3236", learnerNumber: "CPL5499/130" },
  { name: "Shelji Ki", regNumber: "CBPD/11157", certNumber: "CBPD/ISDME/25/3237", learnerNumber: "CPL5499/131" },
  { name: "Shyma A", regNumber: "CBPD/11158", certNumber: "CBPD/ISDME/25/3238", learnerNumber: "CPL5499/132" },
  { name: "Sinimol U", regNumber: "CBPD/11159", certNumber: "CBPD/ISDME/25/3239", learnerNumber: "CPL5499/133" },
  { name: "Sreedevi Vp", regNumber: "CBPD/11160", certNumber: "CBPD/ISDME/25/3240", learnerNumber: "CPL5499/134" },
  { name: "Sreelekshmi Sreekumar", regNumber: "CBPD/11161", certNumber: "CBPD/ISDME/25/3241", learnerNumber: "CPL5499/135" },
  { name: "Steffy Mariya Mathew", regNumber: "CBPD/11162", certNumber: "CBPD/ISDME/25/3242", learnerNumber: "CPL5499/136" },
  { name: "Sumayya N", regNumber: "CBPD/11163", certNumber: "CBPD/ISDME/25/3243", learnerNumber: "CPL5499/137" },
  { name: "Surabhi R", regNumber: "CBPD/11164", certNumber: "CBPD/ISDME/25/3244", learnerNumber: "CPL5499/138" },
  { name: "Tharisha Beevi", regNumber: "CBPD/11165", certNumber: "CBPD/ISDME/25/3245", learnerNumber: "CPL5499/139" },
  { name: "Tisna Sebastian", regNumber: "CBPD/11166", certNumber: "CBPD/ISDME/25/3246", learnerNumber: "CPL5499/140" },
  { name: "Ummukkulsu Kk", regNumber: "CBPD/11167", certNumber: "CBPD/ISDME/25/3247", learnerNumber: "CPL5499/141" },
  { name: "Uthara Uthaman", regNumber: "CBPD/11168", certNumber: "CBPD/ISDME/25/3248", learnerNumber: "CPL5499/142" },
  { name: "Vijayalekshmi S Panicker", regNumber: "CBPD/11169", certNumber: "CBPD/ISDME/25/3249", learnerNumber: "CPL5499/143" },
  { name: "Vydehi M", regNumber: "CBPD/11170", certNumber: "CBPD/ISDME/25/3250", learnerNumber: "CPL5499/144" },
  { name: "Zarina Xavier", regNumber: "CBPD/11171", certNumber: "CBPD/ISDME/25/3251", learnerNumber: "CPL5499/145" },
  { name: "Thafseela Mk", regNumber: "CBPD/11172", certNumber: "CBPD/ISDME/25/3252", learnerNumber: "CPL5499/146" },
  { name: "Jayakrishna Ks", regNumber: "CBPD/11173", certNumber: "CBPD/ISDME/25/3253", learnerNumber: "CPL5499/147" },
  { name: "Geethumol P", regNumber: "CBPD/11174", certNumber: "CBPD/ISDME/25/3254", learnerNumber: "CPL5499/148" }
];

const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

async function seed() {
  const MONGODB_URI = "mongodb://hexenwebcreators:swalihpalakkad@ac-pz8le2d-shard-00-00.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-01.jcbsfsq.mongodb.net:27017,ac-pz8le2d-shard-00-02.jcbsfsq.mongodb.net:27017/?ssl=true&replicaSet=atlas-144nus-shard-0&authSource=admin&retryWrites=true&w=majority&appName=cbpd";
  await mongoose.connect(MONGODB_URI, { dbName: "coachdesk" });
  console.log("Connected to MongoDB.");

  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      regNumber: { type: String, required: true, trim: true },
      certNumber: { type: String, required: true, trim: true },
      learnerNumber: { type: String, required: true, trim: true },
    },
    { timestamps: true }
  );

  const StudentCertificate = mongoose.models.StudentCertificate || mongoose.model("StudentCertificate", schema);

  let successCount = 0;
  let failCount = 0;

  for (let student of students) {
    student.name = capitalizeWords(student.name);

    try {
      // Check for existing to avoid duplicates
      const exists = await StudentCertificate.findOne({
        $or: [
          { regNumber: student.regNumber },
          { certNumber: student.certNumber }
        ]
      });

      if (!exists) {
        await StudentCertificate.create(student);
        console.log(`Added: ${student.name}`);
        successCount++;
      } else {
        console.log(`Skipped (Duplicate): ${student.name}`);
      }
    } catch (err) {
      console.log(`Failed to add ${student.name}: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nCompleted. Added ${successCount} new records. Failed: ${failCount}`);
  process.exit(0);
}

seed();
