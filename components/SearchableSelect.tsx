import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  heightClass?: string;
}

export default function SearchableSelect({ 
  options,
  value, 
  onChange, 
  placeholder = "Selecione...",
  className = "",
  heightClass = "py-2.5"
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  const handleOpen = () => {
    setSearch('');
    setIsOpen(true);
  };

  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : '');

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className={`glass-input w-full pl-4 pr-10 text-slate-800 ${heightClass}`}
          placeholder={selectedOption ? selectedOption.label : placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={handleOpen}
        />
        <div 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer p-1" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="glass-card absolute z-50 w-full mt-1 max-h-60 flex flex-col">
          <ul className="overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500 text-center">Nenhum resultado</li>
            ) : (
              filteredOptions.map((opt) => (
                <li
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 ${value === opt.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
