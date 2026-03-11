const fs = require('fs');

const files = [
  'frontend/src/pages/mechanic/MechanicJobDetailPage.tsx',
  'frontend/src/pages/mechanic/MechanicHistoryPage.tsx',
  'frontend/src/pages/foreman/JobOrdersPage.tsx',
  'frontend/src/pages/foreman/JobHistoryPage.tsx',
  'frontend/src/pages/foreman/JobDetailPage.tsx',
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  const re = /<<<<<<< HEAD\n([\s\S]*?)\n=======\n[\s\S]*?\n>>>>>>> origin\/Krit_front/g;
  const count = (c.match(re) || []).length;
  c = c.replace(re, '$1');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Resolved ' + count + ' conflicts in ' + f);
});

console.log('Done!');
