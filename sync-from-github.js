const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = '/vercel/share/v0-reference-workspace-sources/manoel-domingos/eecmprofjoaobatista/main';
const targetDir = '/vercel/share/v0-project';

console.log('[v0] Fonte:', sourceDir);
console.log('[v0] Destino:', targetDir);

try {
  // Verificar se a origem existe
  if (!fs.existsSync(sourceDir)) {
    console.error('[v0] Diretório de origem não encontrado:', sourceDir);
    process.exit(1);
  }

  // Listar arquivos da origem
  const files = execSync(`find ${sourceDir} -type f -not -path '*/node_modules/*' -not -path '*/.next/*' | head -20`).toString().split('\n');
  console.log('[v0] Primeiros arquivos encontrados:');
  files.forEach(f => f && console.log('[v0]  -', f.replace(sourceDir, '')));

  // Copiar arquivos principais (exceto node_modules, .next, .git)
  const excludePatterns = '--exclude=node_modules --exclude=.next --exclude=.git --exclude=.env* --exclude=out';
  const copyCmd = `rsync -av ${excludePatterns} ${sourceDir}/ ${targetDir}/`;
  
  console.log('[v0] Copiando arquivos...');
  execSync(copyCmd, { stdio: 'inherit' });
  
  console.log('[v0] ✅ Sincronização concluída com sucesso!');
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  process.exit(1);
}
