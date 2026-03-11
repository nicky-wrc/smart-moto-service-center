const fs = require('fs');

const basePath = 'd:/System_Analysis_and_Design/smart-moto-service-center/frontend/src/pages';
const files = [
  `${basePath}/mechanic/MechanicJobDetailPage.tsx`,
  `${basePath}/mechanic/MechanicHistoryPage.tsx`,
  `${basePath}/foreman/JobOrdersPage.tsx`,
  `${basePath}/foreman/JobHistoryPage.tsx`,
  `${basePath}/foreman/JobDetailPage.tsx`,
];

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.log(`File not found: ${f}`);
    return;
  }
  let c = fs.readFileSync(f, 'utf8');
  const re = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> origin\/(Krit_front|merge_oodo)/g;
  const count = (c.match(re) || []).length;
  c = c.replace(re, '$1');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Resolved ' + count + ' merge conflicts in ' + f);
});

console.log('Done resolving conflicts!');
