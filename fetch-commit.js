const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COMMIT = 'bef44f7ec5781169d302f96b14583703565c8f26';
const OWNER = 'manoel-domingos';
const REPO = 'eecmprofjoaobatista';
const PROJECT_DIR = '/vercel/share/v0-project';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'node-fetch' }
    };
    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Baixando commit ${COMMIT}...`);
  
  // Download zip from GitHub
  const zipUrl = `https://github.com/${OWNER}/${REPO}/archive/${COMMIT}.zip`;
  console.log('URL:', zipUrl);
  
  const zipData = await fetch(zipUrl);
  const zipPath = path.join(PROJECT_DIR, 'repo.zip');
  fs.writeFileSync(zipPath, zipData);
  console.log('ZIP baixado:', zipPath, '- Tamanho:', zipData.length, 'bytes');
  
  // Extract
  console.log('Extraindo...');
  execSync(`unzip -o ${zipPath} -d ${PROJECT_DIR}`, { stdio: 'inherit' });
  
  // Find extracted folder
  const extractedDir = path.join(PROJECT_DIR, `${REPO}-${COMMIT}`);
  console.log('Pasta extraída:', extractedDir);
  
  // Copy files
  const items = fs.readdirSync(extractedDir);
  for (const item of items) {
    if (item === 'node_modules' || item === '.git') continue;
    
    const src = path.join(extractedDir, item);
    const dest = path.join(PROJECT_DIR, item);
    
    try {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
    } catch(e) {}
    
    execSync(`cp -r "${src}" "${dest}"`);
    console.log('Copiado:', item);
  }
  
  // Cleanup
  fs.rmSync(zipPath, { force: true });
  fs.rmSync(extractedDir, { recursive: true, force: true });
  
  console.log('Instalando dependências...');
  execSync('npm install', { cwd: PROJECT_DIR, stdio: 'inherit' });
  
  console.log('Pronto!');
}

main().catch(console.error);
