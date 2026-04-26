"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileUp, 
  Check, 
  X, 
  AlertCircle, 
  Table as TableIcon, 
  ChevronRight, 
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Cpu,
  Hash,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateContentWithFallback } from '@/lib/ai';
import { useAppContext } from '@/lib/store';

// ============================================================
// TIPAGENS E CONFIGURAÇÕES
// ============================================================

export type ColumnType =
  | 'NOME'
  | 'TURMA'
  | 'CPF'
  | 'DATA_NASCIMENTO'
  | 'TELEFONE'
  | 'MATRICULA'
  | 'EMAIL'
  | 'ENDERECO'
  | 'GENERO'
  | 'RESPONSAVEL'
  | 'UNKNOWN';

/** Valores válidos para os dropdowns — espelha exatamente as opções da sua UI */
export type FieldOption =
  | 'Ignorar'
  | 'Nome*'
  | 'Turma*'
  | 'CPF'
  | 'Data Nasc.'
  | 'Telefone 1'
  | 'Telefone 2'
  | 'Matrícula'
  | 'Email'
  | 'Gênero'
  | 'Nome Mãe'
  | 'Nome Pai'
  | 'Endereço'
  | 'Observação';

export type ColumnMappingState = Record<number, FieldOption>;

export interface KeywordConfig {
  keywords: string[];
  abbreviations: string[];
  weight: number;
  required: boolean;
  validator: (value: any) => boolean;
  dataPenalty: number;
}

export interface MappedColumn {
  index: number;
  headerValue: string;
  type: ColumnType;
  confidence: number;
}

export interface ScanResult {
  headerRowIndex: number;
  confidence: number;
  columns: MappedColumn[];
  needsAI: boolean;
  reason?: string;
  rawScore: number;
}

export interface DensityRegion {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  density: number;
  rowCount: number;
  colCount: number;
  avgRowLength: number;
  cellCount: number;
}

export type TableOrientation = 'HORIZONTAL' | 'VERTICAL' | 'AMBIGUOUS';

export interface AdvancedScanResult {
  primary: ScanResult & { region: DensityRegion; orientation: TableOrientation };
  secondary: Array<ScanResult & { region: DensityRegion; orientation: TableOrientation }>;
  regions: DensityRegion[];
  anyNeedsAI: boolean;
}

export interface MappingValidation {
  valid: boolean;
  missingRequired: string[];
  duplicates: string[];
}

export interface AlunoRow {
  Nome?: string;
  Turma?: string;
  CPF?: string;
  'Data Nasc.'?: string;
  'Telefone 1'?: string;
  'Telefone 2'?: string;
  Matrícula?: string;
  Email?: string;
  Gênero?: string;
  'Nome Mãe'?: string;
  'Nome Pai'?: string;
  Endereço?: string;
  Observação?: string;
}

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  geminiApiKey?: string;
}

const SCANNER_TO_FIELD: Record<ColumnType, FieldOption> = {
  NOME:            'Nome*',
  TURMA:           'Turma*',
  CPF:             'CPF',
  DATA_NASCIMENTO: 'Data Nasc.',
  TELEFONE:        'Telefone 1',
  MATRICULA:       'Matrícula',
  EMAIL:           'Email',
  GENERO:          'Gênero',
  RESPONSAVEL:     'Nome Mãe',
  ENDERECO:        'Endereço',
  UNKNOWN:         'Ignorar',
};

// ============================================================
// REGEX E CONSTANTES
// ============================================================

const RGX = {
  CPF_MASKED: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
  CPF_RAW: /^\d{11}$/,
  TELEFONE: /^(\+?\d{1,3}[\s-]?)?\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}$/,
  TELEFONE_RAW: /^\d{10,11}$/,
  DATA: /^(0[1-9]|[12]\d|3[01])[\/\-.](0[1-9]|1[0-2])[\/\-.]\d{4}$|^\d{4}[\/\-.](0[1-9]|1[0-2])[\/\-.](0[1-9]|[12]\d|3[01])$/,
  TURMA: /^\d{0,2}\s*[º°ªoa]?\s*(ano|série|serie)?\s*[A-Z]\d?$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NOME: /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s'-][A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
  MATRICULA: /^[A-Za-z]{0,4}\d{4,}$/,
  GENERO: /^(masculino|feminino|m|f|homem|mulher|outro)$/i,
  ENDERECO: /^[A-Za-zÀ-ÖØ-öø-ÿ].*\d+|.*s\/n/i,
  RESPONSAVEL: /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s'-][A-Za-zÀ-ÖØ-öø-ÿ]+)+$/,
  SEQUENTIAL_NUMBER: /^\d{1,4}$/,
};

const COLUMNS = ["Ignorar", "Nome*", "Turma*", "CPF", "Data Nasc.", "Telefone 1", "Telefone 2", "Matrícula", "Email", "Gênero", "Nome Mãe", "Nome Pai", "Endereço", "Observação"] as const;

export default function ImportWizard({ isOpen, onClose, onImport }: { isOpen: boolean, onClose: () => void, onImport: (data: any[]) => void }) {
  const { geminiApiKey, groqApiKey } = useAppContext();
  const [step, setStep] = useState<'upload' | 'config' | 'mapping' | 'review'>('upload');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  
  // Storage for all sheets mapping
  const [sheetMappings, setSheetMappings] = useState<Record<string, { headerRowIndex: number; columnMapping: Record<number, FieldOption> }>>({});
  
  // Current view states (synced with sheetMappings[selectedSheet])
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);
  const [columnMapping, setColumnMapping] = useState<Record<number, string>>({});
  
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [autoDetectProgress, setAutoDetectProgress] = useState<string | null>(null);
  const [autoDetectError, setAutoDetectError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // MOTOR DE ANALISE (HEURÍSTICA FINAL)
  // ============================================================

  const validateCPF = (v: any): boolean => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim().replace(/\D/g, '');
    if (s.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i);
    let r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(s[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(s[i]) * (11 - i);
    r = (sum * 10) % 11;
    if (r === 10 || r === 11) r = 0;
    return r === parseInt(s[10]);
  };

  const KEYWORD_MAP: Record<ColumnType, KeywordConfig> = {
    NOME: {
      keywords: ['nome', 'nome completo', 'aluno', 'estudante', 'discente', 'nome do aluno'],
      abbreviations: ['nom', 'nomp', 'alun', 'estud', 'disc'],
      weight: 12, required: true, dataPenalty: 18,
      validator: (v) => typeof v === 'string' && RGX.NOME.test(v.trim()),
    },
    TURMA: {
      keywords: ['turma', 'série', 'serie', 'classe', 'sala', 'ano', 'período', 'periodo', 'nivel', 'nível', 'grup'],
      abbreviations: ['tur', 'ser', 'cla', 'sal'],
      weight: 12, required: true, dataPenalty: 10,
      validator: (v) => {
        if (typeof v !== 'string' && typeof v !== 'number') return false;
        const s = String(v).trim();
        return RGX.TURMA.test(s) || /^[A-Z]\d?$/.test(s);
      },
    },
    CPF: {
      keywords: ['cpf', 'documento', 'doc'],
      abbreviations: ['cpf', 'doc'],
      weight: 10, required: false, dataPenalty: 20,
      validator: validateCPF,
    },
    DATA_NASCIMENTO: {
      keywords: ['data de nascimento', 'nascimento', 'data nasc', 'dt nasc', 'nasc', 'dn'],
      abbreviations: ['nas', 'nasc', 'dt_nasc', 'dn'],
      weight: 9, required: false, dataPenalty: 15,
      validator: (v) => v instanceof Date || RGX.DATA.test(String(v || '').trim()),
    },
    TELEFONE: {
      keywords: ['telefone', 'celular', 'fone', 'contato', 'whatsapp', 'tel'],
      abbreviations: ['te', 'tel', 'cel'],
      weight: 8, required: false, dataPenalty: 14,
      validator: (v) => {
        const s = String(v || '').trim().replace(/\D/g, '');
        return s.length >= 10 && s.length <= 13;
      },
    },
    MATRICULA: {
      keywords: ['matrícula', 'matricula', 'rm', 'ra', 'ra/rm', 'id'],
      abbreviations: ['mat', 'rm', 'ra'],
      weight: 8, required: false, dataPenalty: 8,
      validator: (v) => typeof v === 'string' || typeof v === 'number',
    },
    EMAIL: {
      keywords: ['email', 'e-mail'],
      abbreviations: ['eml'],
      weight: 7, required: false, dataPenalty: 16,
      validator: (v) => typeof v === 'string' && RGX.EMAIL.test(v.trim()),
    },
    GENERO: {
      keywords: ['sexo', 'gênero', 'genero'],
      abbreviations: ['sex', 'gen'],
      weight: 6, required: false, dataPenalty: 5,
      validator: (v) => typeof v === 'string' && RGX.GENERO.test(v.trim()),
    },
    ENDERECO: {
      keywords: ['endereço', 'endereco', 'rua', 'logradouro'],
      abbreviations: ['end', 'rua'],
      weight: 5, required: false, dataPenalty: 6,
      validator: (v) => typeof v === 'string' && RGX.ENDERECO.test(v.trim()),
    },
    RESPONSAVEL: {
      keywords: ['responsável', 'responsavel', 'pai', 'mãe', 'mae'],
      abbreviations: ['resp', 'pai', 'mae'],
      weight: 7, required: false, dataPenalty: 12,
      validator: (v) => typeof v === 'string' && RGX.RESPONSAVEL.test(v.trim()),
    },
    UNKNOWN: {
      keywords: [], abbreviations: [], weight: 0, required: false, dataPenalty: 0,
      validator: () => false,
    }
  };

  const normalizeText = (text: any): string => 
    String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const looksLikeHeader = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    const s = String(value).trim();
    if (s.length === 0 || RGX.SEQUENTIAL_NUMBER.test(s) || RGX.CPF_RAW.test(s) || RGX.DATA.test(s) || RGX.NOME.test(s)) return false;
    return true;
  };

  const scoreHeaderRow = (row: any[]) => {
    let score = 0; let penalty = 0;
    const mapping: Record<number, ColumnType> = {};
    let knownCount = 0;

    row.forEach((cell, colIdx) => {
      if (!cell) return;
      const normalized = normalizeText(cell);
      let bestMatch: { type: ColumnType; weight: number } | null = null;
      let dataPenalty = 0;

      for (const [type, config] of Object.entries(KEYWORD_MAP)) {
        if (type === 'UNKNOWN') continue;
        const colType = type as ColumnType;
        const cfg = config as KeywordConfig;

        if (cfg.keywords.some(k => normalized === k)) {
          bestMatch = { type: colType, weight: cfg.weight }; break;
        }
        if (cfg.keywords.some(k => normalized.includes(k)) || cfg.abbreviations.includes(normalized)) {
          bestMatch = { type: colType, weight: cfg.weight * 0.8 };
        }
        if (cfg.validator(cell)) dataPenalty = Math.max(dataPenalty, cfg.dataPenalty);
      }

      if (RGX.SEQUENTIAL_NUMBER.test(String(cell).trim())) dataPenalty = Math.max(dataPenalty, 12);

      if (bestMatch) {
        mapping[colIdx] = bestMatch.type;
        score += bestMatch.weight;
        knownCount++;
      } else {
        penalty += dataPenalty;
      }
    });

    return { score: score - penalty, mapping, knownCount };
  };

  const detectMaxColumns = (rows: any[][]) => {
    let max = 0;
    rows.forEach(r => { if (r) max = Math.max(max, r.length); });
    return max;
  };

  const detectDataRegions = (rows: any[][]): DensityRegion[] => {
    const maxCols = detectMaxColumns(rows);
    if (maxCols === 0) return [];
    const regions: DensityRegion[] = [];
    let currentBlock: any = null;

    rows.forEach((row, r) => {
      const nonEmpty = (row || []).filter(c => String(c || '').trim() !== '').length;
      if (nonEmpty > 0) {
        if (!currentBlock) currentBlock = { startRow: r, endRow: r, startCol: 0, endCol: maxCols - 1 };
        else currentBlock.endRow = r;
      } else if (currentBlock) {
        regions.push({ ...currentBlock, cellCount: 10, density: 0.5, rowCount: currentBlock.endRow - currentBlock.startRow + 1, colCount: maxCols, avgRowLength: 5 });
        currentBlock = null;
      }
    });
    if (currentBlock) regions.push({ ...currentBlock, cellCount: 10, density: 0.5, rowCount: currentBlock.endRow - currentBlock.startRow + 1, colCount: maxCols, avgRowLength: 5 });
    return regions;
  };

  const advancedSmartHeuristicScan = (rows: any[][]): ScanResult => {
    const regions = detectDataRegions(rows);
    if (regions.length === 0) return { headerRowIndex: 0, confidence: 0, columns: [], needsAI: true, rawScore: 0 };
    
    const region = regions[0];
    const regionRows = rows.slice(region.startRow, region.endRow + 1);
    
    let bestRow = 0;
    let maxScore = -999;
    let bestMapping: Record<number, ColumnType> = {};

    for (let i = 0; i < Math.min(regionRows.length, 20); i++) {
      const { score, mapping } = scoreHeaderRow(regionRows[i] || []);
      if (score > maxScore) {
        maxScore = score;
        bestRow = i + region.startRow;
        bestMapping = mapping;
      }
    }

    const hasRequired = Object.values(bestMapping).includes('NOME') && Object.values(bestMapping).includes('TURMA');
    
    return {
      headerRowIndex: bestRow,
      confidence: hasRequired ? 90 : 40,
      columns: Object.entries(bestMapping).map(([idx, type]) => ({ index: parseInt(idx), headerValue: '', type: type as ColumnType, confidence: 100 })),
      needsAI: !hasRequired,
      rawScore: maxScore
    };
  };

  const buildColumnMappingFromScan = (scanResult: ScanResult, totalColumns: number): Record<number, FieldOption> => {
    const state: Record<number, FieldOption> = {};
    for (let i = 0; i < totalColumns; i++) state[i] = 'Ignorar';
    const seen: Partial<Record<ColumnType, number>> = {};

    [...scanResult.columns].sort((a, b) => a.index - b.index).forEach(col => {
      const count = (seen[col.type] ?? 0) + 1;
      seen[col.type] = count;
      let field = SCANNER_TO_FIELD[col.type];

      if (col.type === 'TELEFONE') field = count === 1 ? 'Telefone 1' : 'Telefone 2';
      if (col.type === 'RESPONSAVEL') field = count === 1 ? 'Nome Mãe' : 'Nome Pai';
      if (col.confidence >= 50) state[col.index] = field;
    });
    return state;
  };

  const validateColumnMappings = (mappings: Record<number, FieldOption>): MappingValidation => {
    const values = Object.values(mappings).filter((v): v is Exclude<FieldOption, 'Ignorar'> => v !== 'Ignorar');
    const missingRequired = (['Nome*', 'Turma*'] as const).filter(req => !values.includes(req as any));
    const seen: Record<string, number> = {};
    const duplicates: string[] = [];
    for (const v of values) {
      seen[v] = (seen[v] ?? 0) + 1;
      if (seen[v] === 2) duplicates.push(v);
    }
    return { valid: missingRequired.length === 0 && duplicates.length === 0, missingRequired, duplicates };
  };

  // ============================================================
  // FLUXO DE COMPONENTE
  // ============================================================

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'binary', cellDates: true });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
      
      const rows = XLSX.utils.sheet_to_json<any[][]>(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      setPreviewData(rows);
      
      // Run initial heuristic to suggest a header
      const result = advancedSmartHeuristicScan(rows);
      setHeaderRowIndex(result.headerRowIndex);
      
      setStep('config');
    };
    reader.readAsBinaryString(file);
  };

  const autoDetectMapping = async (wb: XLSX.WorkBook) => {
    setIsAutoDetecting(true);
    const newMappings: Record<string, any> = {};
    
    for (const name of wb.SheetNames) {
      setAutoDetectProgress(`Analisando ${name}...`);
      const rows = XLSX.utils.sheet_to_json<any[][]>(wb.Sheets[name], { header: 1 });
      const result = advancedSmartHeuristicScan(rows);
      
      const mapping = buildColumnMappingFromScan(result, (rows[result.headerRowIndex] || []).length);
      newMappings[name] = { headerRowIndex: result.headerRowIndex, columnMapping: mapping };
      
      if (name === wb.SheetNames[0]) {
        setHeaderRowIndex(result.headerRowIndex);
        setColumnMapping(mapping);
        setPreviewData(rows);
      }
    }
    setSheetMappings(newMappings);
    setIsAutoDetecting(false);
    setAutoDetectProgress(null);
  };

  const handleVerifyWithAI = async () => {
    if (!geminiApiKey || !workbook || !selectedSheet) return;
    setIsAutoDetecting(true);
    setAutoDetectProgress("IA analisando estrutura complexa...");
    
    try {
      const rows = XLSX.utils.sheet_to_json<any[][]>(workbook.Sheets[selectedSheet], { header: 1 });
      const preview = rows.slice(0, 15).map(r => r.join(' | ')).join('\n').substring(0, 3000);
      
      const prompt = `Analise este trecho de planilha e identifique:
1. Qual a linha (0-indexed) que contém os cabeçalhos reais?
2. Mapeie as colunas para estes tipos: ${COLUMNS.join(', ')}.
Responda apenas em JSON: {"headerRowIndex": number, "mapping": {"índice_coluna": "Tipo"}}\n\nPlanilha:\n${preview}`;

      const result = await generateContentWithFallback(geminiApiKey, prompt, (model) => setAutoDetectProgress(`IA analisando (${model})...`), groqApiKey);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setHeaderRowIndex(parsed.headerRowIndex);
        setColumnMapping(parsed.mapping as Record<number, FieldOption>);
        setSheetMappings(prev => ({ ...prev, [selectedSheet]: { headerRowIndex: parsed.headerRowIndex, columnMapping: parsed.mapping as Record<number, FieldOption> } }));
      }
    } catch (err) {
      setAutoDetectError("Falha na análise por IA. Tente mapear manualmente.");
    } finally {
      setIsAutoDetecting(false);
      setAutoDetectProgress(null);
    }
  };

  const handleSheetChange = (name: string) => {
    setSelectedSheet(name);
    const rows = XLSX.utils.sheet_to_json<any[][]>(workbook!.Sheets[name], { header: 1 });
    setPreviewData(rows);
    const m = sheetMappings[name];
    if (m) {
      setHeaderRowIndex(m.headerRowIndex);
      setColumnMapping(m.columnMapping);
    }
  };

  const handleFinalImport = () => {
    const validation = validateColumnMappings(columnMapping);
    if (!validation.valid) {
      setAutoDetectError(`Faltam campos obrigatórios: ${validation.missingRequired.join(', ')}`);
      return;
    }

    setIsImporting(true);
    const allStudents: any[] = [];

    Object.entries(sheetMappings).forEach(([name, m]) => {
      const rows = XLSX.utils.sheet_to_json<any[][]>(workbook!.Sheets[name], { header: 1 });
      const dataRows = rows.slice(m.headerRowIndex + 1);
      
      dataRows.forEach(row => {
        const student: any = {};
        let hasData = false;
        Object.entries(m.columnMapping).forEach(([colIdx, field]) => {
          if (field !== 'Ignorar') {
            const val = row[parseInt(colIdx)];
            if (val !== undefined && val !== null) {
              student[field.replace('*', '')] = String(val).trim();
              hasData = true;
            }
          }
        });
        if (hasData && student.Nome && student.Turma) allStudents.push(student);
      });
    });

    onImport(allStudents);
    setIsImporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header & Steps */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileUp className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Importação Inteligente</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Heurística Avançada + IA</p>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              {[
                { id: 'upload', label: 'Upload' },
                { id: 'mapping', label: 'Mapeamento' },
                { id: 'success', label: 'Finalizado' }
              ].map((s, i, arr) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.id 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 scale-110' 
                      : (arr.findIndex(x => x.id === step) > i ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')
                    }`}>
                      {arr.findIndex(x => x.id === step) > i ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-bold hidden sm:block ${step === s.id ? 'text-blue-500' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-4 h-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden md:block">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'upload' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xl border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center gap-6 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileUp className="w-10 h-10 text-slate-400 group-hover:text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Arraste sua planilha ou clique aqui</h3>
                  <p className="text-sm text-slate-500 mt-2">Suporta .xlsx, .xls e .csv (Múltiplas abas suportadas)</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx,.xls,.csv" />
              </div>
            </div>
          ) : step === 'mapping' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
              {/* Header Info */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                    Mapeamento de Colunas
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Confirme quais colunas correspondem a cada campo. A linha destacada em azul é o cabeçalho detectado.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Verifique o mapeamento
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Toolbar: Sheets */}
              {sheetNames.length > 1 && (
                <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Abas:</span>
                  {sheetNames.map(name => (
                    <button
                      key={name}
                      onClick={() => handleSheetChange(name)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedSheet === name 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-blue-500'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {/* Table Area */}
              <div className="flex-1 overflow-auto p-0 relative no-scrollbar">
                <table className="w-full text-sm border-separate border-spacing-0">
                  <thead className="sticky top-0 z-20 bg-white dark:bg-slate-900 shadow-sm">
                    <tr>
                      <th className="p-4 w-16 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">LINHA</th>
                      {(previewData[headerRowIndex] || Array(10).fill('')).map((_, colIdx) => (
                        <th key={colIdx} className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                          <select
                            value={columnMapping[colIdx] || 'Ignorar'}
                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [colIdx]: e.target.value }))}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          >
                            <option value="Ignorar">Ignorar</option>
                            {COLUMNS.filter(c => c !== 'Ignorar').map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 50).map((row, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => setHeaderRowIndex(idx)}
                        className={`group cursor-pointer transition-colors ${
                          headerRowIndex === idx 
                          ? 'bg-blue-50/50 dark:bg-blue-500/10' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <td className={`p-3 text-center border-b border-slate-50 dark:border-slate-800 font-medium ${
                           headerRowIndex === idx ? 'text-blue-600' : 'text-slate-400'
                        }`}>
                          {headerRowIndex === idx ? '↓' : idx}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`p-4 border-b border-slate-50 dark:border-slate-800 transition-colors relative ${
                            headerRowIndex === idx ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            <div className="truncate max-w-[250px]">
                              {String(cell || '—')}
                            </div>
                            
                            {/* Hover Tooltip */}
                            {headerRowIndex !== idx && cIdx === 0 && (
                              <div className="absolute left-full top-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ml-4">
                                <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2">
                                  <Menu className="w-3 h-3" />
                                  Clique para usar esta linha como cabeçalho
                                </div>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Mapping */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <p className="text-xs text-slate-500 font-medium">
                    {previewData.length} linhas de dados detectadas.
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Mapeie Nome* e Turma* para continuar.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={onClose} className="px-6 py-2.5 text-slate-500 hover:text-slate-700 font-bold transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinalImport}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    Concluir Importação →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/30">
               <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-12 shadow-2xl flex flex-col items-center gap-8 text-center">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CheckSquare className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white">Importação Finalizada!</h3>
                    <p className="text-slate-500 mt-2">Seus dados foram processados com sucesso e estão disponíveis no sistema.</p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold transition-transform active:scale-95"
                  >
                    Voltar aos Alunos
                  </button>
               </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
