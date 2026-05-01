const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
const mongoUriLine = envFile.split('\n').find(line => line.startsWith('MONGO_URI'));
const MONGO_URI = mongoUriLine.replace('MONGO_URI', '').replace('=', '').trim();

const studentSchema = new mongoose.Schema({
  fullName: String,
  gender: String,
  phoneNumber: String,
  dateOfBirth: Date,
  joiningDate: Date,
  state: String,
  district: String,
  currentCourse: String,
  department: String,
  semester: String,
  admissionNumber: String,
  registerNumber: String,
  certificateNumber: String,
  learnerNumber: String,
  institutionId: mongoose.Schema.Types.ObjectId,
  isActive: Boolean
}, { timestamps: true });

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    // Create a dummy institution ID just for testing the search
    const fakeInstitutionId = new mongoose.Types.ObjectId();

    const testStudent = new Student({
      fullName: "Test Learner Doe",
      gender: "Male",
      phoneNumber: "+1234567890",
      dateOfBirth: new Date("1995-01-01"),
      joiningDate: new Date(),
      state: "Test State",
      district: "Test District",
      currentCourse: "Test Course",
      department: "Test Department",
      semester: "1",
      admissionNumber: "ADM-TEST-001",
      registerNumber: "REG-998877",
      certificateNumber: "CERT-112233",
      learnerNumber: "LRN-556677",
      institutionId: fakeInstitutionId,
      isActive: true
    });

    await testStudent.save();
    console.log("Test student added successfully!");
    console.log({
      fullName: testStudent.fullName,
      registerNumber: testStudent.registerNumber,
      certificateNumber: testStudent.certificateNumber,
      learnerNumber: testStudent.learnerNumber
    });

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
