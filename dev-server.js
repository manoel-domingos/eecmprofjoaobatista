const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

try {
  const libDir = path.join(process.cwd(), 'lib');
  
  // Garantir que a pasta lib existe
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  // Criar version.json se não existir
  const versionPath = path.join(libDir, 'version.json');
  if (!fs.existsSync(versionPath)) {
    const date = new Date();
    const versionStr = date.toLocaleString('pt-BR', { timeZone: 'America/Cuiaba' });
    fs.writeFileSync(versionPath, JSON.stringify({ version: versionStr }, null, 2));
    console.log('[v0] Version.json criado:', versionStr);
  }
  
  console.log('[v0] Iniciando Next.js dev server...');
  console.log('[v0] Diretório:', process.cwd());
  
  const server = spawn('npx', ['next', 'dev'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (err) => {
    console.error('[v0] ❌ Erro:', err);
    process.exit(1);
  });
  
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  process.exit(1);
}
