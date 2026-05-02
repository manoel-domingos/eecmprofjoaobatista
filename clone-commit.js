const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COMMIT = 'bef44f7ec5781169d302f96b14583703565c8f26';
const REPO = 'https://github.com/manoel-domingos/eecmprofjoaobatista.git';
const PROJECT_DIR = '/vercel/share/v0-project';
const TEMP_DIR = path.join(PROJECT_DIR, 'temp-clone');

console.log(`Clonando commit ${COMMIT}...`);

// Remove temp dir if exists
try {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
} catch(e) {
  console.log('Aviso ao remover pasta:', e.message);
}

// Clone repo
try {
  execSync(`git clone ${REPO} ${TEMP_DIR}`, { stdio: 'inherit' });
} catch(e) {
  console.error('Erro no clone:', e.message);
  process.exit(1);
}

// Checkout specific commit
try {
  execSync(`git checkout ${COMMIT}`, { cwd: TEMP_DIR, stdio: 'inherit' });
} catch(e) {
  console.error('Erro no checkout:', e.message);
  process.exit(1);
}

console.log('Copiando arquivos...');

// Copy all files except node_modules, .git, temp-clone
const items = fs.readdirSync(TEMP_DIR);
for (const item of items) {
  if (item === 'node_modules' || item === '.git') continue;
  
  const src = path.join(TEMP_DIR, item);
  const dest = path.join(PROJECT_DIR, item);
  
  // Remove existing
  try {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
  } catch(e) {
    console.log(`Aviso ao remover ${item}:`, e.message);
  }
  
  // Copy
  try {
    execSync(`cp -r "${src}" "${dest}"`);
    console.log(`Copiado: ${item}`);
  } catch(e) {
    console.log(`Erro ao copiar ${item}:`, e.message);
  }
}

// Cleanup
try {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
} catch(e) {
  console.log('Aviso ao limpar:', e.message);
}

console.log('Concluído! Instalando dependências...');
try {
  execSync('npm install', { cwd: PROJECT_DIR, stdio: 'inherit' });
} catch(e) {
  console.log('Aviso npm install:', e.message);
}

console.log('Pronto! Versão do commit instalada com sucesso.');
