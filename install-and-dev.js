const { execSync } = require('child_process');

try {
  console.log('[v0] Instalando dependências com pnpm...');
  execSync('pnpm install', { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  console.log('[v0] ✅ Dependências instaladas!');
  console.log('[v0] Iniciando dev server: pnpm dev');
  execSync('pnpm dev', { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  process.exit(1);
}
