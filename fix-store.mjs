import fs from 'fs';
let content = fs.readFileSync('lib/store.tsx', 'utf8');

content = content.replace(
  /  const archiveStudent = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archiveStudent = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('students').update({ archived: true }).eq('id', id);
    setStudents(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Aluno', id, \`Arquivado aluno: \${id}\`);
  };

  const deleteStudent = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('students').delete().eq('id', id);
    setStudents(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Aluno', id, \`Excluído aluno definitivamente: \${id}\`);
  };`
);

content = content.replace(
  /  const restoreStudent = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restoreStudent = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('students').update({ archived: false }).eq('id', id);
    setStudents(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Aluno', id, \`Restaurado aluno: \${id}\`);
  };`
);

content = content.replace(
  /  const archiveOccurrence = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archiveOccurrence = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('occurrences').update({ archived: true }).eq('id', id);
    setOccurrences(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Ocorrência', id, \`Arquivada ocorrência \${id}\`);
  };

  const deleteOccurrence = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('occurrences').delete().eq('id', id);
    setOccurrences(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Ocorrência', id, \`Excluída ocorrência definitivamente \${id}\`);
  };`
);

content = content.replace(
  /  const restoreOccurrence = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restoreOccurrence = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('occurrences').update({ archived: false }).eq('id', id);
    setOccurrences(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Ocorrência', id, \`Restaurada ocorrência \${id}\`);
  };`
);

content = content.replace(
  /  const archiveAccident = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archiveAccident = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('accidents').update({ archived: true }).eq('id', id);
    setAccidents(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Acidente', id, \`Arquivado acidente \${id}\`);
  };

  const deleteAccident = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('accidents').delete().eq('id', id);
    setAccidents(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Acidente', id, \`Excluído acidente definitivamente \${id}\`);
  };`
);

content = content.replace(
  /  const restoreAccident = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restoreAccident = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('accidents').update({ archived: false }).eq('id', id);
    setAccidents(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Acidente', id, \`Restaurado acidente \${id}\`);
  };`
);

content = content.replace(
  /  const archivePraise = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archivePraise = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('praises').update({ archived: true }).eq('id', id);
    setPraises(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Elogio', id, \`Arquivado elogio \${id}\`);
  };

  const deletePraise = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('praises').delete().eq('id', id);
    setPraises(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Elogio', id, \`Excluído elogio definitivamente \${id}\`);
  };`
);

content = content.replace(
  /  const restorePraise = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restorePraise = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('praises').update({ archived: false }).eq('id', id);
    setPraises(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Elogio', id, \`Restaurado elogio \${id}\`);
  };`
);

content = content.replace(
  /  const archiveSummons = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archiveSummons = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('summons').update({ archived: true }).eq('id', id);
    setSummons(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Convocação', id, \`Arquivada convocação \${id}\`);
  };

  const deleteSummons = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('summons').delete().eq('id', id);
    setSummons(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Convocação', id, \`Excluída convocação definitivamente \${id}\`);
  };`
);

content = content.replace(
  /  const restoreSummons = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restoreSummons = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('summons').update({ archived: false }).eq('id', id);
    setSummons(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Convocação', id, \`Restaurada convocação \${id}\`);
  };`
);

content = content.replace(
  /  const archiveConductTerm = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const archiveConductTerm = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('conduct_terms').update({ archived: true }).eq('id', id);
    setConductTerms(prev => prev.map(item => item.id === id ? { ...item, archived: true } : item));
    logAction('UPDATE', 'Termo de Conduta', id, \`Arquivado TAC \${id}\`);
  };

  const deleteConductTerm = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('conduct_terms').delete().eq('id', id);
    setConductTerms(prev => prev.filter(item => item.id !== id));
    logAction('DELETE', 'Termo de Conduta', id, \`Excluído TAC definitivamente \${id}\`);
  };`
);

content = content.replace(
  /  const restoreConductTerm = async \(id: string\) => \{[^]*?logAction[^]*?;\s*\};/g,
  `  const restoreConductTerm = async (id: string) => {
    checkWriteAccess();
    if (supabase && isSupabaseConnected) await supabase.from('conduct_terms').update({ archived: false }).eq('id', id);
    setConductTerms(prev => prev.map(item => item.id === id ? { ...item, archived: false } : item));
    logAction('UPDATE', 'Termo de Conduta', id, \`Restaurado TAC \${id}\`);
  };`
);

fs.writeFileSync('lib/store.tsx', content);
