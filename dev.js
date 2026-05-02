const { execSync } = require('child_process');

try {
  console.log('[v0] Executando script set-version...');
  execSync('node scripts/set-version.js', { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
  
  console.log('[v0] Iniciando Next.js dev server...');
  execSync('next dev', { 
    cwd: process.cwd(),
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  process.exit(1);
}
