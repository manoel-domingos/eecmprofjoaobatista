const { exec } = require('child_process');
const path = require('path');

const projectPath = process.cwd();

console.log('[v0] Caminho atual:', projectPath);
console.log('[v0] Iniciando sincronização com GitHub...');

exec(`git fetch origin main && git reset --hard origin/main`, { cwd: projectPath }, (error, stdout, stderr) => {
  if (error) {
    console.error('[v0] Erro:', error.message);
    console.error('[v0] stderr:', stderr);
    process.exit(1);
  }
  console.log('[v0] Sincronização concluída!');
  console.log(stdout);
});
