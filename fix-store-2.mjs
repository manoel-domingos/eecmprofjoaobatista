import fs from 'fs';
let content = fs.readFileSync('lib/store.tsx', 'utf8');

content = content.replace(
  /restoreStudent: \(id: string\) => Promise<void>;/,
  "restoreStudent: (id: string) => Promise<void>;\n  deleteStudent: (id: string) => Promise<void>;"
);
content = content.replace(
  /restoreOccurrence: \(id: string\) => Promise<void>;/,
  "restoreOccurrence: (id: string) => Promise<void>;\n  deleteOccurrence: (id: string) => Promise<void>;"
);
content = content.replace(
  /restoreAccident: \(id: string\) => Promise<void>;/,
  "restoreAccident: (id: string) => Promise<void>;\n  deleteAccident: (id: string) => Promise<void>;"
);
content = content.replace(
  /restorePraise: \(id: string\) => Promise<void>;/,
  "restorePraise: (id: string) => Promise<void>;\n  deletePraise: (id: string) => Promise<void>;"
);
content = content.replace(
  /restoreSummons: \(id: string\) => Promise<void>;/,
  "restoreSummons: (id: string) => Promise<void>;\n  deleteSummons: (id: string) => Promise<void>;"
);
content = content.replace(
  /restoreConductTerm: \(id: string\) => Promise<void>;/,
  "restoreConductTerm: (id: string) => Promise<void>;\n  deleteConductTerm: (id: string) => Promise<void>;"
);


content = content.replace(
  /archiveStudent, restoreStudent, deleteAllStudents,/,
  "archiveStudent, restoreStudent, deleteStudent, deleteAllStudents,"
);
content = content.replace(
  /archiveOccurrence, restoreOccurrence,/,
  "archiveOccurrence, restoreOccurrence, deleteOccurrence,"
);
content = content.replace(
  /archiveAccident, restoreAccident,/,
  "archiveAccident, restoreAccident, deleteAccident,"
);
content = content.replace(
  /archivePraise, restorePraise,/,
  "archivePraise, restorePraise, deletePraise,"
);
content = content.replace(
  /archiveSummons, restoreSummons,/,
  "archiveSummons, restoreSummons, deleteSummons,"
);
content = content.replace(
  /archiveConductTerm, restoreConductTerm,/,
  "archiveConductTerm, restoreConductTerm, deleteConductTerm,"
);

fs.writeFileSync('lib/store.tsx', content);
