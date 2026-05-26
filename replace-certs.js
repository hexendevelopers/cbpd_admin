const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processDir(dir) {
    walkDir(dir, function(filePath) {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let newContent = content.replace(/Certificate Requests/g, 'Certificate Request')
                                .replace(/certificate requests/g, 'certificate request');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log('Updated: ' + filePath);
        }
      }
    });
}

processDir('d:/web/cbpd_admin/src/app');
processDir('d:/web/cbpd_admin/src/components');
processDir('d:/web/CBPD_frontend/src/app');
processDir('d:/web/CBPD_frontend/src/components');
processDir('d:/web/CBPD_frontend/src/lib');
