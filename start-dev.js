const { spawn } = require('child_process');

console.log('[v0] Iniciando dev server...');

const devServer = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (err) => {
  console.error('[v0] ❌ Erro ao iniciar dev server:', err);
  process.exit(1);
});

devServer.on('close', (code) => {
  console.log('[v0] Dev server encerrado com código:', code);
});
