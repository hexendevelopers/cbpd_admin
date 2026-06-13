const fs = require('fs');

let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

const startIdx = content.indexOf('const menuItems = [');
const matchEnd = content.match(/  ];\r?\n\r?\n  const getBreadcrumbItems/);
if (!matchEnd) {
  console.error("Could not find end of menuItems array.");
  process.exit(1);
}
const endIdx = matchEnd.index;

if (startIdx === -1) {
  console.error("Could not find menuItems array.");
  process.exit(1);
}

let menuItemsStr = content.substring(startIdx, endIdx);

const blocks = menuItemsStr.split(/\r?\n    \{\r?\n      key:/);

let parsedItems = [];
for (let i = 1; i < blocks.length; i++) {
  let fullBlock = '\n    {\n      key:' + blocks[i];
  
  const match = fullBlock.match(/label:\s*"([^"]+)"/);
  if (match) {
    let label = match[1];
    // Trim trailing comma and whitespace
    fullBlock = fullBlock.replace(/,\s*$/, '');
    parsedItems.push({ label, content: fullBlock });
  } else {
    console.log("Could not find label in block", fullBlock.substring(0, 50));
  }
}

const desiredOrder = [
  "Dashboard",
  "DIVIDER_1",
  "Courses",
  "Question Papers",
  "Hall Tickets",
  "DIVIDER_2",
  "Learners",
  "Memberships",
  "Institutions",
  "Centers",
  "Administrators",
  "DIVIDER_3",
  "Learner Certificates",
  "Certificates",
  "CIMAA Certificate",
  "DIVIDER_4",
  "Invoices",
  "Receipts",
  "Enquiries"
];

let newItemsStr = "const menuItems = [";
for (const label of desiredOrder) {
  if (label.startsWith("DIVIDER")) {
    newItemsStr += "\n    { type: \"divider\" },";
    continue;
  }
  
  let found = false;
  for (const item of parsedItems) {
    if (item.label === label) {
      newItemsStr += item.content + ",";
      found = true;
      break;
    }
  }
  if (!found) {
    console.log("Warning: could not find " + label);
  }
}

// remove trailing comma
newItemsStr = newItemsStr.replace(/,$/, '');

const newContent = content.substring(0, startIdx) + newItemsStr + content.substring(endIdx);

fs.writeFileSync('src/components/AdminLayout.tsx', newContent, 'utf-8');
console.log("Successfully reordered menuItems.");
