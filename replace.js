const fs = require('fs');
const path = require('path');

const files = [
  'd:/web/cbpd_admin/src/app/admin/students/page.tsx',
  'd:/web/cbpd_admin/src/app/admin/student-certificates/add/page.tsx',
  'd:/web/cbpd_admin/src/app/admin/student-certificates/page.tsx',
  'd:/web/cbpd_admin/src/app/admin/institutions/page.tsx',
  'd:/web/cbpd_admin/src/app/admin/page.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/students/page.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/certificate-requests/new/page.tsx',
  'd:/web/CBPD_frontend/src/components/Sidebar.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace UI visible text only. 
    // This is a heuristic approach to avoid breaking code logic.
    // Replace "Student" -> "Learner" where it is preceded by a quote, greater-than, or space
    
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
      { regex: /\bstudents selected\b/g, replacement: "learners selected" },
      { regex: /\bstudent selected\b/g, replacement: "learner selected" },
      { regex: /\bStudents List\b/g, replacement: "Learners List" },
      { regex: /\bStudent Details\b/g, replacement: "Learner Details" },
      { regex: /\bStudent Name\b/g, replacement: "Learner Name" },
      { regex: /title="Total Students"/g, replacement: 'title="Total Learners"' },
      { regex: /title="Active Students"/g, replacement: 'title="Active Learners"' },
      { regex: /title="Total Learners"/g, replacement: 'title="Total Learners"' },
      { regex: /placeholder="Search students/g, replacement: 'placeholder="Search learners' },
      { regex: /message:\s*'Student/g, replacement: "message: 'Learner" },
      { regex: /message:\s*"Student/g, replacement: 'message: "Learner' },
      { regex: /Add Student/g, replacement: "Add Learner" },
      { regex: /Edit Student/g, replacement: "Edit Learner" },
      { regex: /Delete Student/g, replacement: "Delete Learner" },
      { regex: /Search Students/g, replacement: "Search Learners" },
      { regex: /Filter Students/g, replacement: "Filter Learners" },
      { regex: /Student Analytics/g, replacement: "Learner Analytics" },
      { regex: /Students by Institution/g, replacement: "Learners by Institution" },
      { regex: /Loading Students/g, replacement: "Loading Learners" },
      { regex: /Manage and monitor all student records/g, replacement: "Manage and monitor all learner records" },
    ];

    patterns.forEach(p => {
      content = content.replace(p.regex, p.replacement);
    });

    // Write back
    fs.writeFileSync(file, content);
    console.log("Updated " + file);
  }
});
