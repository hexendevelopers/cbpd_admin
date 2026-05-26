const fs = require('fs');
const content = fs.readFileSync('d:/web/cbpd_admin/src/app/admin/certificate-requests/page.tsx', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if(line.toLowerCase().includes('certificate request')) {
    console.log(`${i+1}: ${line.trim()}`);
  }
});
