import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getFiles(dir, files = []) {
  const list = readdirSync(dir);
  for (const file of list) {
    const name = join(dir, file);
    if (statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx')) {
      files.push(name);
    }
  }
  return files;
}

const files = [...getFiles('app'), ...getFiles('components')];
console.log(`Found ${files.length} tsx files.`);

let replacements = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  let original = content;

  // Replace default bg-white containers with glassy dark mode
  content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, (match, p1, p2) => {
    // If it already has dark:, don't overly modify, but if it doesn't:
    if (match.includes('dark:bg-')) return match;
    
    // Replace bg-white with glassy version
    let newClasses = p1 + 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md' + p2;
    // Replace text-slate-X with dark text
    if (!newClasses.includes('dark:text-')) {
       newClasses = newClasses.replace(/text-slate-(\d00)/g, 'text-slate-$1 dark:text-slate-200');
    }
    // Replace borders
    if (!newClasses.includes('dark:border-')) {
       newClasses = newClasses.replace(/border-slate-200/g, 'border-slate-200/50 dark:border-slate-700/50');
    }

    return `className="${newClasses}"`;
  });

  // Specifically target the header rows in tables which are often bg-slate-50
  content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, (match, p1, p2) => {
    if (match.includes('dark:bg-')) return match;
    let newClasses = p1 + 'bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md' + p2;
    if (!newClasses.includes('dark:text-')) {
       newClasses = newClasses.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
    }
    if (!newClasses.includes('dark:border-')) {
       newClasses = newClasses.replace(/border-slate-200/g, 'border-slate-200/50 dark:border-slate-700/50');
    }
    return `className="${newClasses}"`;
  });

  // Table rows bg on hover
  content = content.replace(/hover:bg-slate-50(?!.*dark:hover)/g, 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50');
  
  if (content !== original) {
    writeFileSync(file, content);
    replacements++;
    console.log(`Updated ${file}`);
  }
}

console.log(`Updated ${replacements} files.`);
