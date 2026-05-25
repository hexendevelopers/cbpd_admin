const fs = require('fs');
const path = require('path');

function searchFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(searchFiles(fullPath));
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (/student/i.test(line)) {
            // ignore API endpoints
            if(line.includes('/api/')) return;
            // ignore variable declarations
            if(line.includes('const student') || line.includes('let student') || line.includes('var student')) return;
            // ignore imports
            if(line.includes('import ') && line.includes(' from ')) return;
            
            // if it looks like a UI string:
            if(line.includes('>') && line.includes('<') && />[^<]*student[^<]*</i.test(line)) {
                results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
            } else if (/(label|title|placeholder|message|description)=[\"'][^\"']*student[^\"']*[\"']/i.test(line)) {
                results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
            } else if (/(['\"\`])[^'\"\`]*student[^'\"\`]*\1/.test(line)) {
                // simple string literals
                results.push(`${fullPath}:${index + 1}: ${line.trim()}`);
            }
        }
      });
    }
  }
  return results;
}

const found = searchFiles('./src/app/admin');
const foundComponents = searchFiles('./src/components');
console.log([...found, ...foundComponents].join('\n'));
