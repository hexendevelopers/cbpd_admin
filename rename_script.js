const fs = require('fs');

function replaceInFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}

const studentsPageReplacements = [
  ['"Students data exported', '"Learners data exported'],
  ['Edit Student', 'Edit Learner'],
  ['Delete Student', 'Delete Learner'],
  ['title: "Student"', 'title: "Learner"'],
  ['Loading Students...', 'Loading Learners...'],
  ['Students Management', 'Learners Management'],
  ['Import Students', 'Import Learners'],
  ['Add Student', 'Add Learner'],
  ['Total Students', 'Total Learners'],
  ['Active Students', 'Active Learners'],
  ['Filter Students', 'Filter Learners'],
  ['Search Students', 'Search Learners'],
  ['Student Details', 'Learner Details'],
  ['"Edit Student" : "Add Student"', '"Edit Learner" : "Add Learner"'],
  ['"Student details', '"Learner details'],
  ['"Student Name"', '"Learner Name"'],
  ['student Name', 'learner Name']
];

replaceInFile('src/app/admin/students/page.tsx', studentsPageReplacements);

const institutionsPageReplacements = [
  ['title="Total Students"', 'title="Total Learners"'],
  ['title="Active Students"', 'title="Active Learners"']
];
replaceInFile('src/app/admin/institutions/page.tsx', institutionsPageReplacements);

const certPageReplacements = [
  ['Student Certificates', 'Learner Certificates'],
  ['Student Name', 'Learner Name']
];
replaceInFile('src/app/admin/student-certificates/page.tsx', certPageReplacements);

const generateCertReplacements = [
  ['label="Student Name"', 'label="Learner Name"'],
  ['message: "Student name is required"', 'message: "Learner name is required"']
];
replaceInFile('src/app/admin/certificates/generate/page.tsx', generateCertReplacements);

const bulkImportReplacements = [
  ['Import Students', 'Import Learners'],
  ['title="Bulk Import Students"', 'title="Bulk Import Learners"'],
  ['Student Name', 'Learner Name']
];
replaceInFile('src/components/BulkImportModal.tsx', bulkImportReplacements);

const addStudentCertReplacements = [
  ['Add Student Certificate', 'Add Learner Certificate'],
  ['Student Name', 'Learner Name']
];
replaceInFile('src/app/admin/student-certificates/add/page.tsx', addStudentCertReplacements);

console.log('All replacements done');
