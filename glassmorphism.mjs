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

  // Cleanup messed up classes from previous runs
  content = content.replace(/bg-white\/\d+ dark:bg-slate-\d+\/\d+ backdrop-blur-\w+(\/\d+)?/g, 'bg-white');
  content = content.replace(/bg-white\/\d+/g, 'bg-white');
  content = content.replace(/backdrop-blur-\w+(\/\d+)?/g, '');

  content = content.replace(/className=(["`])([^"`]*)\1|className=\{`([^`]*)`\}/g, (match, quote, classes1, classes2) => {
    let classes = classes1 !== undefined ? classes1 : classes2;
    let newClasses = classes.trim().split(/\s+/).map(cls => {
      // Find `bg-white` and replace with our liquid glass classes
      if (cls === 'bg-white') {
         return 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl';
      }
      return cls;
    }).filter(cls => cls !== '').join(' ');

    // Inject text and border colors if bg-white was replaced
    if (newClasses !== classes.trim()) {
        if (!newClasses.includes('dark:text-')) {
           newClasses = newClasses.replace(/text-slate-(\d00)/g, 'text-slate-$1 dark:text-slate-200');
        }
        if (!newClasses.includes('dark:border-') && !newClasses.includes('border-transparent')) {
           newClasses = newClasses.replace(/border-slate-[23]00(\/\d+)?/g, 'border-white/20 dark:border-slate-700/50');
        }
        if (newClasses.includes('shadow-')) {
           newClasses = newClasses.replace(/shadow-(sm|md|lg|xl|2xl)/g, 'shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]');
        }
    }

    // Clean up duplicate classes maintaining order
    let uniqueArr = [];
    newClasses.split(' ').forEach(c => {
       if(!uniqueArr.includes(c)) uniqueArr.push(c);
    });
    
    if (classes1 !== undefined) {
      return `className=${quote}${uniqueArr.join(' ')}${quote}`;
    } else {
      return `className={\`${uniqueArr.join(' ')}\`}`;
    }
  });

  if (content !== original) {
    writeFileSync(file, content);
    replacements++;
  }
}
console.log(`Updated ${replacements} files.`);
