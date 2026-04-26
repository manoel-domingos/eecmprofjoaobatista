"use client";

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Download, CheckCircle, AlertTriangle, Bot, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles } from 'lucide-react';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (students: any[]) => Promise<void>;
  geminiApiKey?: string;
}

const COLUMNS = ["Ignorar", "Nome*", "Turma*", "Turno", "Matrícula", "CPF", "Data Nasc.", "Telefone 1", "Telefone 2", "Nome Mãe", "Nome Pai", "Endereço", "Observação"];

export default function ImportWizard({ isOpen, onClose, onImport, geminiApiKey }: ImportWizardProps) {
  const [step, setStep] = useState(1);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [rawRows, setRawRows] = useState<any[][]>([]);
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      setWorkbook(wb);
      setSheets(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
      
      const data = XLSX.utils.sheet_to_json<any[][]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      setRawRows(data);
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const autoDetectMapping = async () => {
    if (!geminiApiKey || rawRows.length === 0) return;
    setIsAutoDetecting(true);
    try {
      const ai = new GoogleGenerativeAI(geminiApiKey);
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const csvPreview = rawRows.slice(0, 20).map(row => row.join(',')).join('\n').substring(0, 1500);
      
      const prompt = `
      Analise o seguinte trecho de CSV e retorne um JSON identificando o índice da linha de cabeçalho (0-19) e o mapeamento das colunas.
      Opções de colunas permitidas: ["Nome*", "Turma*", "Turno", "Matrícula", "CPF", "Data Nasc.", "Telefone 1", "Telefone 2", "Mãe", "Pai", "Observação"]
      Formato esperado: { "headerRowIndex": 0, "columns": { "0": "Nome*", "1": "Turma*" } }
      CSV:
      ${csvPreview}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed.headerRowIndex !== undefined) setHeaderRowIndex(parsed.headerRowIndex);
      if (parsed.columns) {
        const newMapping: Record<number, string> = {};
        Object.entries(parsed.columns).forEach(([key, value]) => {
          newMapping[parseInt(key)] = value as string;
        });
        setColumnMapping(newMapping);
      }
    } catch (error) {
      console.error("Erro na detecção automática", error);
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const processToReview = () => {
    if (!workbook || !selectedSheet) return;
    const ws = workbook.Sheets[selectedSheet];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { range: headerRowIndex, defval: '', raw: false, header: 1 });
    
    const students = data.slice(1).map(row => {
      const student: any = { contacts: [], error: false };
      let hasName = false;
      let hasClass = false;

      Object.entries(columnMapping).forEach(([colIndex, colName]) => {
        const val = row[Number(colIndex)];
        if (!val) return;

        switch (colName) {
          case 'Nome*': student.name = val; hasName = true; break;
          case 'Turma*': 
            // Converte formatos curtos como 1A ou 1 A para 1º Ano A
            let turmaVal = String(val).trim();
            if (/^\d[A-Z]$/i.test(turmaVal)) {
              turmaVal = turmaVal.replace(/^(\d)([A-Z])$/i, '$1º Ano $2');
            } else if (/^\d\s[A-Z]$/i.test(turmaVal)) {
              turmaVal = turmaVal.replace(/^(\d)\s([A-Z])$/i, '$1º Ano $2');
            }
            student.class = turmaVal;
            hasClass = true; 
            break;
          case 'Turno': 
            const t = String(val).toLowerCase();
            if (t.includes('mat') || t.includes('manh')) student.shift = 'Matutino';
            else if (t.includes('vesp') || t.includes('tard')) student.shift = 'Vespertino';
            else if (t.includes('not')) student.shift = 'Noturno';
            else student.shift = 'Matutino'; 
            break;
          case 'Matrícula': student.registrationNumber = val; break;
          case 'CPF': student.cpf = val; break;
          case 'Data Nasc.': student.birthDate = val; break;
          case 'Endereço': student.address = val; break;
          case 'Telefone 1': student.contacts.push({ name: 'Principal', phone: String(val) }); break;
          case 'Telefone 2': student.contacts.push({ name: 'Secundário', phone: String(val) }); break;
          case 'Nome Mãe': 
            const mae = student.contacts.find((c: any) => c.name === 'Mãe');
            if (mae) mae.name = String(val);
            else student.contacts.push({ name: 'Mãe', phone: '' });
            break;
          case 'Nome Pai': 
            const pai = student.contacts.find((c: any) => c.name === 'Pai');
            if (pai) pai.name = String(val);
            else student.contacts.push({ name: 'Pai', phone: '' });
            break;
          case 'Observação': student.observation = val; break;
        }
      });

      if (!hasName || !hasClass) student.error = true;
      return student;
    });

    setParsedStudents(students);
    setStep(3);
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Nome*", "Turma*", "Turno", "Matrícula", "CPF", "Data Nasc.", "Telefone 1", "Mãe", "Pai"],
      ["João Silva", "1A", "Manhã", "2024001", "123.456.789-00", "15/05/2010", "(11) 99999-9999", "Maria Silva", "José Silva"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template_importacao_alunos.xlsx");
  };

  const hasRequiredFields = Object.values(columnMapping).includes('Nome*') && Object.values(columnMapping).includes('Turma*');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UploadCloud className="text-blue-600" />
              Assistente de Importação
            </h2>
            <p className="text-slate-500 text-sm">Siga os passos para importar sua base de alunos</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center p-6 bg-white border-b border-slate-100 gap-4">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                  step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s ? <CheckCircle size={20} /> : s}
                </div>
                <span className={`font-semibold ${step >= s ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s === 1 ? 'Upload' : s === 2 ? 'Mapeamento' : 'Revisão'}
                </span>
              </div>
              {s < 3 && <div className={`w-16 h-1 rounded-full ${step > s ? 'bg-blue-600' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-3 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center gap-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud size={40} />
                  </div>
                  <div className="text-center">
                    <p className="text-blue-500 font-bold mb-2">Clique para selecionar ou arraste o arquivo</p>
                    <p className="text-slate-400 text-xs">Suporta .xlsx, .xls e .csv</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Download className="text-blue-500" size={18} />
                      Não tem uma planilha?
                    </h4>
                    <p className="text-sm text-slate-500 mb-4">Baixe nosso modelo padrão para preencher com seus dados e garantir que a importação ocorra sem erros.</p>
                    <button 
                      onClick={downloadTemplate}
                      className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1.5 transition-all"
                    >
                      Baixar Modelo Exemplo (.xlsx)
                    </button>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 border-dashed">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                      <Sparkles className="text-blue-500" size={18} />
                      Dica Inteligente
                    </h4>
                    <p className="text-sm text-blue-600/80">O assistente consegue ler planilhas de outros sistemas (como o SGE). Use a Auto-detecção no próximo passo para economizar tempo!</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Mapeamento Inteligente</h4>
                      <p className="text-xs text-slate-500">Ajuste qual coluna do Excel corresponde a qual dado no sistema.</p>
                    </div>
                  </div>
                  <button 
                    onClick={autoDetectMapping}
                    disabled={isAutoDetecting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isAutoDetecting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Auto-detectar Colunas
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="text-orange-500">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Linha de Início (Cabeçalho)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" 
                        max={Math.min(20, rawRows.length - 1)} 
                        value={headerRowIndex}
                        onChange={(e) => setHeaderRowIndex(parseInt(e.target.value))}
                        className="flex-1 accent-orange-500"
                      />
                      <span className="text-sm font-bold text-orange-700 bg-white px-3 py-1 rounded-lg border border-orange-200 min-w-[60px] text-center">Linha {headerRowIndex + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-inner bg-slate-50/30">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                      <tr className="bg-slate-100">
                        {rawRows[headerRowIndex]?.map((_, idx) => (
                          <th key={idx} className="p-4 border-r border-slate-200 min-w-[180px]">
                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5">Coluna {idx + 1}</div>
                            <select 
                              value={columnMapping[idx] || "Ignorar"}
                              onChange={(e) => setColumnMapping(prev => ({ ...prev, [idx]: e.target.value }))}
                              className={`w-full p-2.5 rounded-lg border-2 font-bold text-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all ${
                                columnMapping[idx] && columnMapping[idx] !== "Ignorar" 
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                                : "border-slate-200 bg-white text-slate-500"
                              }`}
                            >
                              {COLUMNS.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rawRows.slice(headerRowIndex, headerRowIndex + 8).map((row, rIdx) => (
                        <tr key={rIdx} className={`transition-colors ${rIdx === 0 ? "bg-blue-50 border-b-2 border-blue-200" : "hover:bg-white bg-white/50 border-b border-slate-100"}`}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-4 text-sm ${rIdx === 0 ? "font-bold text-blue-800" : "text-slate-600 italic"} border-r border-slate-100`}>
                              {cell?.toString().substring(0, 80) || <span className="text-slate-300 opacity-50">---</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2 mt-4 px-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>A linha em destaque azul é considerada o <strong>cabeçalho</strong>. Os dados abaixo dela serão importados.</span>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="text-2xl font-black text-slate-800">{parsedStudents.length}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Total detectado</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="text-2xl font-black text-green-600">{parsedStudents.filter(s => !s.error).length}</div>
                    <div className="text-xs font-bold text-green-700 uppercase">Válidos</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="text-2xl font-black text-red-600">{parsedStudents.filter(s => s.error).length}</div>
                    <div className="text-xs font-bold text-red-700 uppercase">Com Erro</div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[400px] shadow-inner">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 sticky top-0 shadow-sm z-10 text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Aluno</th>
                        <th className="p-3 text-left">Turma</th>
                        <th className="p-3 text-left">Contatos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedStudents.map((student, idx) => (
                        <tr key={idx} className={`${student.error ? 'bg-red-50/50' : 'bg-white'}`}>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${student.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {student.error ? 'INVÁLIDO' : 'OK'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{student.name || 'Sem nome'}</td>
                          <td className="p-3">{student.class || '-'}</td>
                          <td className="p-3">{student.contacts?.length || 0} contatos</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div className="text-slate-400 text-xs">
            {step === 2 && !hasRequiredFields && "Selecione 'Nome*' e 'Turma*' para continuar."}
          </div>
          <div className="flex gap-4">
            {step > 1 && (
              <button 
                onClick={() => setStep(s => s - 1)} 
                className="px-6 py-3 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-all"
              >
                Voltar
              </button>
            )}
            {step === 3 && (
              <button 
                onClick={() => onImport(parsedStudents.filter(s => !s.error))}
                disabled={parsedStudents.filter(s => !s.error).length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-green-500/20 disabled:opacity-50"
              >
                <CheckCircle size={20} /> Concluir Importação
              </button>
            )}
            {step === 2 && (
              <button 
                onClick={processToReview}
                disabled={!hasRequiredFields}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                Revisar Dados <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
