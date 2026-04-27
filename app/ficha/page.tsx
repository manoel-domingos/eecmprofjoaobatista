'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAppContext } from '@/lib/store';
import { FileBadge, Search, Printer } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function FichaDisciplinar() {
  const { students, getStudentPoints, getStudentOccurrences, rules } = useAppContext();
  const [selectedStudent, setSelectedStudent] = useState('');

  const student = students.find(s => s.id === selectedStudent);
  const occurrences = student ? getStudentOccurrences(student.id) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <FileBadge className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Anexo II</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Ficha Disciplinar do Aluno</h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <label className="block text-sm font-medium text-slate-600 mb-2">Selecione o Aluno</label>
          <div className="relative max-w-xl">
             <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
             <select 
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Buscar aluno...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - {s.class} ({s.shift})</option>
                ))}
              </select>
          </div>
        </div>

        {student && (
          <div className="bg-slate-50 text-slate-900 rounded-xl p-8 max-w-4xl shadow-2xl relative">
            <div className="flex items-center gap-3 no-print mb-8">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4" /> PDF / Imprimir
              </button>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition text-sm shadow-sm"
                onClick={() => {
                   // DOCX Export for Ficha
                   const headerHtmlDocx = `
                    <div style="width: 100%; margin-bottom: 20px;">
                      <img src="${window.location.origin}/CABEÇALHO JB.png" width="100%" style="width: 100%; height: auto;" alt="Cabeçalho">
                    </div>
                   `;
                   const htmlContent = `
                    <div style="font-family: Arial, sans-serif; padding: 20pt;">
                      ${headerHtmlDocx}
                      
                      <div style="border: 1px solid #000; padding: 10pt; margin-bottom: 20pt;">
                        <p><strong>NOME:</strong> ${student.name?.toUpperCase()}</p>
                        <p><strong>TURMA:</strong> ${student.class?.toUpperCase()} - ${student.shift?.toUpperCase()}</p>
                        <p><strong>NOTA ATUAL:</strong> ${getStudentPoints(student.id).toFixed(1)}</p>
                      </div>

                      <h3 style="text-decoration: underline;">HISTÓRICO DE OCORRÊNCIAS</h3>
                      <table style="width: 100%; border-collapse: collapse; margin-top: 10pt;">
                        <thead>
                          <tr style="background-color: #f1f5f9;">
                            <th style="border: 1px solid #000; padding: 5pt;">Data</th>
                            <th style="border: 1px solid #000; padding: 5pt;">Art.</th>
                            <th style="border: 1px solid #000; padding: 5pt;">Falta/Infração</th>
                            <th style="border: 1px solid #000; padding: 5pt;">Gravidade</th>
                            <th style="border: 1px solid #000; padding: 5pt;">Pontos</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${occurrences.map(o => {
                            const rule = rules.find(r => r.code === o.ruleCode);
                            return `
                              <tr>
                                <td style="border: 1px solid #000; padding: 5pt;">${formatDate(o.date)}</td>
                                <td style="border: 1px solid #000; padding: 5pt; text-align: center;">${o.ruleCode}</td>
                                <td style="border: 1px solid #000; padding: 5pt;">${rule?.description?.toUpperCase()}</td>
                                <td style="border: 1px solid #000; padding: 5pt;">${rule?.severity?.toUpperCase()}</td>
                                <td style="border: 1px solid #000; padding: 5pt; text-align: center;">${rule?.points}</td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>

                      <br><br><br><br>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="border-top: 1px solid #000; text-align: center; width: 45%;">ASSINATURA DO ALUNO</td>
                          <td style="width: 10%;"></td>
                          <td style="border-top: 1px solid #000; text-align: center; width: 45%;">ASSINATURA DO GESTOR</td>
                        </tr>
                      </table>
                    </div>
                   `;
                   const fullHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${htmlContent}</body></html>`;
                   const blob = new Blob(['\ufeff', fullHtml], { type: 'application/msword' });
                   const url = URL.createObjectURL(blob);
                   const link = document.createElement('a');
                   link.href = url;
                   link.download = `Ficha_Disciplinar_${student.name?.replace(/ /g, '_')}.doc`;
                   link.click();
                }}
              >
                <FileBadge className="w-4 h-4" /> DOCX
              </button>
            </div>

            <div className="hidden print:block mb-8">
              <img src="/CABEÇALHO JB.png" className="w-full h-auto" alt="Cabeçalho Oficial" />
            </div>

            <div className="text-center mb-8">
               <h3 className="font-black text-xl mt-2 underline text-slate-900">FICHA DISCIPLINAR INDIVIDUAL (ANEXO II)</h3>
            </div>

            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-2 gap-4 border border-slate-900 p-4 font-semibold uppercase">
                 <div>NOME: {student.name}</div>
                 <div>TURMA: {student.class}</div>
                 <div>TURNO: {student.shift}</div>
                 <div>NOTA ATUAL: <span className="text-xl">{getStudentPoints(student.id).toFixed(1)}</span></div>
              </div>

              <h4 className="font-bold uppercase border-b-2 border-slate-900 pb-1 mt-6">Histórico de Ocorrências</h4>
              
              <table className="w-full border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-200 uppercase text-xs">
                    <th className="border border-slate-900 p-2 text-left w-24">Data</th>
                    <th className="border border-slate-900 p-2 text-left w-16">Art.</th>
                    <th className="border border-slate-900 p-2 text-left">Falta/Infração</th>
                    <th className="border border-slate-900 p-2 text-center w-24">Grav./Pontos</th>
                    <th className="border border-slate-900 p-2 text-left">Registrado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {occurrences.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-slate-900 p-4 text-center italic">
                        Nenhuma ocorrência registrada no histórico deste aluno.
                      </td>
                    </tr>
                  ) : (
                    occurrences.map(o => {
                      const rule = rules.find(r => r.code === o.ruleCode);
                      return (
                        <tr key={o.id}>
                          <td className="border border-slate-900 p-2">{formatDate(o.date)}</td>
                          <td className="border border-slate-900 p-2 text-center">{o.ruleCode}</td>
                          <td className="border border-slate-900 p-2 text-xs">{rule?.description}</td>
                          <td className="border border-slate-900 p-2 text-center whitespace-nowrap">
                            {rule?.severity} ({rule?.points})
                          </td>
                          <td className="border border-slate-900 p-2 text-xs">{o.registeredBy}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>

              <div className="mt-20 pt-8 flex justify-around text-center">
                 <div>
                   <div className="w-64 border-b border-slate-900 mb-2"></div>
                   <p className="font-bold uppercase text-xs">Assinatura do Aluno</p>
                 </div>
                 <div>
                   <div className="w-64 border-b border-slate-900 mb-2"></div>
                   <p className="font-bold uppercase text-xs">Assinatura do Gestor</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
