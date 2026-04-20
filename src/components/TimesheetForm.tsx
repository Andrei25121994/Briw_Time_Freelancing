import { useState } from 'react';
import { Plus, X, Clock, MapPin, AlignLeft } from 'lucide-react';
import type { TimesheetFormData } from '../types/timesheet';

interface TimesheetFormProps {
  onSubmit: (data: TimesheetFormData) => Promise<void>;
  onCancelEdit?: () => void;
}

export function TimesheetForm({ onSubmit, onCancelEdit }: TimesheetFormProps) {
  const [formData, setFormData] = useState<TimesheetFormData>({
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    break_time: 0,
    hourly_rate: 0, // Acesta se va popula din firma selectată în Dashboard
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Resetăm descrierea după succes
      setFormData(prev => ({ ...prev, description: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Secțiunea Data și Locație */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] text-slate-500 mb-1 ml-1 font-bold uppercase tracking-widest">Data Pontaj</label>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-slate-100 outline-none focus:border-blue-500 transition-colors text-base" 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] text-slate-500 mb-1 ml-1 font-bold uppercase tracking-widest">Locație</label>
          <select 
            name="location"
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-slate-100 outline-none focus:border-blue-500 transition-colors text-base appearance-none"
            onChange={handleChange}
          >
            <option value="Birou">🏢 Birou (Office)</option>
            <option value="Acasă">🏠 Acasă (Remote)</option>
          </select>
        </div>
      </div>

      {/* Secțiunea Ore */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[10px] text-slate-500 mb-1 ml-1 font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock size={10}/> Start
          </label>
          <input 
            type="text" 
            name="start_time" 
            value={formData.start_time} 
            onChange={handleChange} 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center font-mono text-slate-100 outline-none focus:border-blue-500" 
            placeholder="09:00" 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] text-slate-500 mb-1 ml-1 font-bold uppercase tracking-widest flex items-center gap-1">
            <Clock size={10}/> Final
          </label>
          <input 
            type="text" 
            name="end_time" 
            value={formData.end_time} 
            onChange={handleChange} 
            className="bg-slate-800 border border-slate-700 p-3 rounded-xl text-center font-mono text-slate-100 outline-none focus:border-blue-500" 
            placeholder="17:00" 
          />
        </div>
      </div>

      {/* Descriere */}
      <div className="flex flex-col">
        <label className="text-[10px] text-slate-500 mb-1 ml-1 font-bold uppercase tracking-widest flex items-center gap-1">
          <AlignLeft size={10}/> Descriere Activitate
        </label>
        <textarea 
          name="description"
          value={formData.description} 
          onChange={handleChange} 
          className="bg-slate-800 border border-slate-700 p-4 rounded-xl h-28 text-slate-100 outline-none focus:border-blue-500 transition-colors text-base resize-none" 
          placeholder="La ce proiect ai lucrat astăzi?..." 
        />
      </div>

      {/* Buton Salvare */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className={`w-full ${isSubmitting ? 'bg-slate-700' : 'bg-blue-600 hover:bg-blue-500'} text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2`}
      >
        {isSubmitting ? (
          <span className="animate-pulse">Se salvează...</span>
        ) : (
          <>
            <Plus size={20} /> Salvează în Cloud
          </>
        )}
      </button>
    </form>
  );
}