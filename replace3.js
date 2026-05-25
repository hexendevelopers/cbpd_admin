const fs = require('fs');

const files = [
  'd:/web/CBPD_frontend/src/app/dashboard/layout.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/students/add/page.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/students/edit/[id]/page.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/students/page.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/certificate-requests/new/page.tsx',
  'd:/web/CBPD_frontend/src/app/login/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    const patterns = [
      { regex: />\s*Students\b/g, replacement: "> Learners" },
      { regex: />\s*Student\b/g, replacement: "> Learner" },
      { regex: />Students\b/g, replacement: ">Learners" },
      { regex: />Student\b/g, replacement: ">Learner" },
      { regex: /"Students\b/g, replacement: "\"Learners" },
      { regex: /"Student\b/g, replacement: "\"Learner" },
      { regex: /'Students\b/g, replacement: "'Learners" },
      { regex: /'Student\b/g, replacement: "'Learner" },
      { regex: /\bStudents\s*</g, replacement: "Learners <" },
      { regex: /\bStudent\s*</g, replacement: "Learner <" },
      { regex: /\bStudents</g, replacement: "Learners<" },
      { regex: /\bStudent</g, replacement: "Learner<" },
      { regex: /Total Students/g, replacement: "Total Learners" },
      { regex: /Add Student/g, replacement: "Add Learner" },
      { regex: /Edit Student/g, replacement: "Edit Learner" },
      { regex: /Delete Student/g, replacement: "Delete Learner" },
      { regex: /Search Students/g, replacement: "Search Learners" },
      { regex: /Filter Students/g, replacement: "Filter Learners" },
      { regex: /Student Name/g, replacement: "Learner Name" },
      { regex: /student selected/g, replacement: "learner selected" },
      { regex: /students selected/g, replacement: "learners selected" },
    ];

    patterns.forEach(p => {
      content = content.replace(p.regex, p.replacement);
    });

    fs.writeFileSync(file, content);
    console.log("Updated " + file);
  }
});
