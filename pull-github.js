const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoUrl = 'https://github.com/manoel-domingos/eecmprofjoaobatista.git';
const tempDir = path.join(process.cwd(), '.temp-repo');
const targetDir = process.cwd();

try {
  console.log('[v0] Diretório de trabalho:', targetDir);
  console.log('[v0] Iniciando clone do repositório...');
  
  // Remover diretório temp se existir
  if (fs.existsSync(tempDir)) {
    console.log('[v0] Removendo clone anterior...');
    execSync(`rm -rf ${tempDir}`);
  }
  
  // Clonar repositório
  console.log('[v0] Clonando repositório:', repoUrl);
  execSync(`git clone --depth 1 ${repoUrl} ${tempDir}`, { stdio: 'inherit' });
  
  console.log('[v0] Copiando arquivos...');
  
  // Listar e copiar arquivos
  const files = fs.readdirSync(tempDir).filter(f => 
    !['node_modules', '.git', '.next', '.env.local', '.gitignore'].includes(f)
  );
  
  console.log(`[v0] Encontrados ${files.length} itens para copiar`);
  
  files.forEach(file => {
    const src = path.join(tempDir, file);
    const dst = path.join(targetDir, file);
    
    // Remover destino se existir
    if (fs.existsSync(dst)) {
      execSync(`rm -rf ${dst}`);
    }
    
    // Copiar
    execSync(`cp -r ${src} ${dst}`);
    console.log(`[v0] ✓ Copiado: ${file}`);
  });
  
  // Limpar temp
  console.log('[v0] Limpando...');
  execSync(`rm -rf ${tempDir}`);
  
  console.log('[v0] ✅ Sincronização concluída!');
  console.log('[v0] Próximo passo: pnpm install');
} catch (error) {
  console.error('[v0] ❌ Erro:', error.message);
  try {
    execSync(`rm -rf ${tempDir}`);
  } catch (e) {}
  process.exit(1);
}
