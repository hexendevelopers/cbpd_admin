const fs = require('fs');

const files = [
  'd:/web/cbpd_admin/src/app/admin/certificate-requests/page.tsx',
  'd:/web/CBPD_frontend/src/components/DashboardLayout.tsx',
  'd:/web/CBPD_frontend/src/app/dashboard/certificate-requests/page.tsx',
  'd:/web/CBPD_frontend/src/components/Sidebar.tsx',
  'd:/web/cbpd_admin/src/components/Sidebar.tsx'
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
    ];

    patterns.forEach(p => {
      content = content.replace(p.regex, p.replacement);
    });

    fs.writeFileSync(file, content);
    console.log("Updated " + file);
  }
});
