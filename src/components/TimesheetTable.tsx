import { Edit2, Trash2, Clock, DollarSign, MapPin } from 'lucide-react';
import { formatDate, formatCurrency, formatHours } from '../utils/calculations';
import type { TimesheetEntry } from '../types/timesheet';

interface TimesheetTableProps {
  entries: TimesheetEntry[];
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: string) => void;
}

export function TimesheetTable({ entries, onEdit, onDelete }: TimesheetTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 p-12 text-center">
        <p className="text-slate-500 font-bold uppercase italic tracking-tighter text-sm">
          Nu există înregistrări pentru această perioadă.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* DESKTOP VIEW - Tabel clasic, dar pe stilul Dark */}
      <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interval</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ore</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Suma</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descriere</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-200">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-blue-400 uppercase">
                    {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-bold text-slate-300">
                    {formatHours(entry.total_hours)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-black text-emerald-400">
                    {formatCurrency(entry.total_amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate italic">
                    {entry.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(entry)} className="text-slate-500 hover:text-blue-500 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirm('Ștergem pontajul?') && onDelete(entry.id)} 
                        className="text-slate-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW - Carduri optimizate pentru deget/telefon */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl active:border-blue-500 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{formatDate(entry.date)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock size={12} className="text-slate-500"/>
                  <span className="text-sm font-mono text-slate-200">{entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-400 leading-none">{formatCurrency(entry.total_amount)}</p>
                <p className="text-[10px] text-slate-500 mt-1">{formatHours(entry.total_hours)} ore total</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-xl italic mb-4">
              {entry.description || 'Fără descriere...'}
            </p>

            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button onClick={() => onEdit(entry)} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-2 rounded-xl text-xs font-bold text-slate-300">
                <Edit2 size={14}/> Editează
              </button>
              <button onClick={() => onDelete(entry.id)} className="flex-1 flex items-center justify-center gap-2 bg-slate-800 py-2 rounded-xl text-xs font-bold text-red-400">
                <Trash2 size={14}/> Șterge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}