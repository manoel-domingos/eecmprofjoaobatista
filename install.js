const { execSync } = require('child_process');

try {
  console.log('[v0] Instalando dependências com npm...');
  execSync('npm install', { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  console.log('[v0] ✅ Dependências instaladas!');
  console.log('[v0] Dev server pode ser iniciado com: npm run dev');
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  process.exit(1);
}
