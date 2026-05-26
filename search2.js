const fs = require('fs');
const content = fs.readFileSync('d:/web/cbpd_admin/src/components/AdminLayout.tsx', 'utf-8');
if (content.toLowerCase().includes('certificate')) {
  console.log("Yes");
}
