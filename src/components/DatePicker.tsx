import { useState, useEffect, useRef } from 'react';

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
};

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

export default function DatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement | null>(null);
  const isPaperTheme = typeof document !== 'undefined' && document.body.classList.contains('theme-paper');

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      setDisplayDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selected = value ? new Date(value) : null;

  const handleSelect = (d: number) => {
    const dd = new Date(year, month, d);
    onChange(`${dd.getFullYear()}-${pad(dd.getMonth()+1)}-${pad(dd.getDate())}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full text-left px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isPaperTheme ? 'bg-white/90 hover:bg-sky-50 border border-sky-200 text-slate-900' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
      >
        {value || new Date().toISOString().split('T')[0]}
      </button>

      {open && (
        <div className={`absolute z-50 mt-2 w-64 rounded-lg shadow-lg p-3 ${isPaperTheme ? 'bg-white/95 border border-sky-200 text-slate-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 text-white'}`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setDisplayDate(new Date(year, month - 1, 1))} className={`p-1 rounded ${isPaperTheme ? 'hover:bg-sky-100' : 'hover:bg-slate-800'}`}>‹</button>
            <div className="text-sm font-semibold">{displayDate.toLocaleString(undefined, { month: 'long' })} {year}</div>
            <button onClick={() => setDisplayDate(new Date(year, month + 1, 1))} className={`p-1 rounded ${isPaperTheme ? 'hover:bg-sky-100' : 'hover:bg-slate-800'}`}>›</button>
          </div>
          <div className={`grid grid-cols-7 gap-1 text-xs mb-2 ${isPaperTheme ? 'text-slate-500' : 'text-slate-400'}`}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`b-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
              return (
                <button key={day} onClick={() => handleSelect(day)} className={`py-2 rounded text-sm ${isSelected ? 'bg-blue-600 text-white' : isPaperTheme ? 'hover:bg-sky-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'}`}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
