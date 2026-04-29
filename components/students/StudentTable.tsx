'use client';

import React from 'react';
import type { Student, BehaviorClass } from '@/lib/types';
import { SkeletonTable } from '@/components/ui/Skeleton';

interface StudentTableProps {
  students: Student[];
  onRowClick?: (student: Student) => void;
  getStudentPoints: (studentId: string) => number;
  getStudentBehavior: (points: number) => BehaviorClass;
  isReadOnly?: boolean;
  isLoading?: boolean;
  formatPhoneForWhatsApp?: (phone: string, studentName: string) => string | null;
}

const behaviorColorMap: Record<BehaviorClass, string> = {
  'Excepcional': 'bg-emerald-500/10 text-emerald-600',
  'Ótimo': 'bg-blue-500/10 text-blue-600',
  'Bom': 'bg-slate-500/10 text-slate-600',
  'Regular': 'bg-yellow-500/10 text-yellow-600',
  'Insuficiente': 'bg-rose-500/10 text-rose-600',
  'Incompatível': 'bg-red-500/10 text-red-600',
};

export function StudentTable({
  students,
  onRowClick,
  getStudentPoints,
  getStudentBehavior,
  isReadOnly = false,
  isLoading = false,
  formatPhoneForWhatsApp,
}: StudentTableProps) {
  if (isLoading) {
    return <SkeletonTable rows={8} columns={6} />;
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="sticky top-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold z-10">
          <tr>
            <th className="px-6 py-3 font-medium">Nome</th>
            <th className="px-6 py-3 font-medium">Turma</th>
            <th className="px-6 py-3 font-medium">Turno</th>
            <th className="px-6 py-3 font-medium">Contatos</th>
            <th className="px-6 py-3 font-medium">Classe Comportamental</th>
            <th className="px-6 py-3 font-medium text-center">Nota Atual</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-600">
          {students.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                Nenhum aluno encontrado.
              </td>
            </tr>
          ) : (
            students.map((student) => {
              const points = getStudentPoints(student.id);
              const behavior = getStudentBehavior(points);
              
              return (
                <tr
                  key={student.id}
                  onClick={() => !isReadOnly && onRowClick?.(student)}
                  className={`transition border-b border-slate-100 last:border-0 text-slate-600 ${
                    !isReadOnly ? 'hover:bg-slate-50 cursor-pointer' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <span className="truncate">{student.name}</span>
                  </td>
                  <td className="px-6 py-4">{student.class}</td>
                  <td className="px-6 py-4">{student.shift}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <StudentContacts 
                      contacts={student.contacts} 
                      studentName={student.name}
                      formatPhoneForWhatsApp={formatPhoneForWhatsApp}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${behaviorColorMap[behavior]}`}
                    >
                      {behavior}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StudentScore points={points} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Sub-components
interface StudentContactsProps {
  contacts?: { name: string; phone: string }[];
  studentName: string;
  formatPhoneForWhatsApp?: (phone: string, studentName: string) => string | null;
}

function StudentContacts({ contacts, studentName, formatPhoneForWhatsApp }: StudentContactsProps) {
  if (!contacts || contacts.length === 0) {
    return <span className="text-xs italic text-slate-400">---</span>;
  }

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {contacts.map((contact, i) => {
        const waLink = formatPhoneForWhatsApp?.(contact.phone, studentName);
        return (
          <div key={i} className="text-xs flex items-center gap-1.5">
            <span className="text-slate-400 capitalize">{contact.name || 'Resp.'}:</span>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium flex items-center transition"
              >
                {contact.phone}
              </a>
            ) : (
              <span>{contact.phone}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface StudentScoreProps {
  points: number;
}

function StudentScore({ points }: StudentScoreProps) {
  const isGood = points >= 7;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-sm font-black ${isGood ? 'text-blue-600' : 'text-red-500'}`}>
        {points.toFixed(1)}
      </span>
      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isGood ? 'bg-blue-500' : 'bg-red-500'}`}
          style={{ width: `${points * 10}%` }}
        />
      </div>
    </div>
  );
}

export default StudentTable;
