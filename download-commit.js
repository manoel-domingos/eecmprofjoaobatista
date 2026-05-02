const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COMMIT = 'bef44f7ec5781169d302f96b14583703565c8f26';
const OWNER = 'manoel-domingos';
const REPO = 'eecmprofjoaobatista';
const PROJECT_DIR = '/vercel/share/v0-project';

console.log(`Baixando commit ${COMMIT}...`);

const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/${COMMIT}.zip`;
const zipPath = path.join(PROJECT_DIR, 'repo.zip');

// Download using curl
execSync(`curl -L -o ${zipPath} "${zipUrl}"`, { stdio: 'inherit' });

console.log('ZIP baixado, extraindo...');

// Extract
execSync(`unzip -o ${zipPath}`, { cwd: PROJECT_DIR, stdio: 'inherit' });

// Find extracted folder
const extractedDir = path.join(PROJECT_DIR, `${REPO}-${COMMIT}`);
console.log('Copiando de:', extractedDir);

// Copy files
const items = fs.readdirSync(extractedDir);
for (const item of items) {
  if (item === 'node_modules' || item === '.git') continue;
  
  const src = path.join(extractedDir, item);
  const dest = path.join(PROJECT_DIR, item);
  
  try { fs.rmSync(dest, { recursive: true, force: true }); } catch(e) {}
  
  execSync(`cp -r "${src}" "${dest}"`);
  console.log('Copiado:', item);
}

// Cleanup
fs.rmSync(zipPath, { force: true });
fs.rmSync(extractedDir, { recursive: true, force: true });

console.log('Instalando dependências...');
execSync('npm install', { cwd: PROJECT_DIR, stdio: 'inherit' });

console.log('Pronto! Versão do commit instalada.');
