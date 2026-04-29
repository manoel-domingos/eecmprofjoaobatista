'use client';

import React from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  searchTerm,
  onSearchChange,
  placeholder = 'Buscar...',
  className = '',
}: SearchFilterProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="glass-input w-full pl-10 pr-10 py-2 text-sm text-slate-800"
      />
      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
          aria-label="Limpar busca"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}

export function SelectFilter({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
}: SelectFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input w-full px-4 py-2 text-sm text-slate-800 appearance-none pr-10"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
  totalCount?: number;
  filteredCount?: number;
  entityName?: string;
  actions?: React.ReactNode;
}

export function FilterBar({
  children,
  totalCount,
  filteredCount,
  entityName = 'itens',
  actions,
}: FilterBarProps) {
  const showCount = typeof totalCount === 'number' && typeof filteredCount === 'number';
  
  return (
    <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="relative w-full max-w-2xl flex items-center gap-3">
        {children}
      </div>
      <div className="flex items-center gap-4">
        {showCount && (
          <span className="text-sm text-slate-500 font-medium whitespace-nowrap">
            {filteredCount === totalCount ? (
              <>Total: <span className="font-bold text-slate-800">{totalCount}</span> {entityName}</>
            ) : (
              <>
                <span className="font-bold text-slate-800">{filteredCount}</span> de {totalCount} {entityName}
              </>
            )}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

export default SearchInput;
