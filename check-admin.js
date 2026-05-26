const fs = require('fs');
const content = fs.readFileSync('d:/web/cbpd_admin/src/app/admin/certificate-requests/page.tsx', 'utf-8');
const lines = content.split('\n');
let found = false;
lines.forEach((line, i) => {
  if(line.includes('Your certificate request has been successfully submitted and is currently pending review')) {
    found = true;
    console.log(`Found at line ${i+1}`);
  }
});
