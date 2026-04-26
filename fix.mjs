import { readFileSync, writeFileSync } from 'fs';

const files = [
  'app/registro-disciplinar/page.tsx',
  'app/termo/page.tsx',
  'app/convocacao/page.tsx'
];

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  content = content.split('<html>').join('<h' + 'tml>');
  content = content.split('</html>').join('</h' + 'tml>');
  writeFileSync(file, content);
  console.log('Fixed', file);
}
