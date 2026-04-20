import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ICONITE SVG MANUALE - STABILE
const IconPlus = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconDownload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function Dashboard() {
  const [firms, setFirms] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date().toISOString().substring(0, 7));
  const [expandedFirms, setExpandedFirms] = useState<Record<string, boolean>>({});
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'WORK' | 'LEAVE'>('WORK');
  const [fName, setFName] = useState('');
  const [fRate, setFRate] = useState(70);
  const [selectedFirmId, setSelectedFirmId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('BIROU');
  const [leaveType, setLeaveType] = useState('CONCEDIU ODIHNA');
  const [desc, setDesc] = useState('');

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const hh = h < 10 ? `0${h}` : h;
    return `${hh}:${m}`;
  });

  useEffect(() => { fetchData(); }, [viewDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: fData } = await (supabase.from('firms') as any).select('*').order('name');
      const { data: eData } = await (supabase.from('timesheet_entries') as any).select('*').order('date', { ascending: false });
      if (fData) setFirms(fData);
      if (eData) setEntries(eData);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  const handleSaveFirm = async () => {
    if (!fName) return alert("NUME FIRMA!");
    const { error } = await (supabase.from('firms') as any).insert([{ name: fName.toUpperCase(), rate: Number(fRate) }]);
    if (!error) { setFName(''); setIsFirmModalOpen(false); fetchData(); }
  };

  const handleSaveEntry = async () => {
    const firm = firms.find(f => f.id === selectedFirmId);
    if (!firm) return alert("ALEGE CLIENTUL!");
    
    let finalDesc = activeTab === 'WORK' ? `[${location}] ${desc.toUpperCase() || 'ACTIVITATE'}` : `[${leaveType}]`;
    const [hS, mS] = startTime.split(':').map(Number);
    const [hE, mE] = endTime.split(':').map(Number);
    let diff = (hE * 60 + mE) - (hS * 60 + mS);
    if (diff <= 0) diff += 1440;
    
    const hours = activeTab === 'WORK' ? diff / 60 : 8;
    const amount = activeTab === 'WORK' ? (diff / 60) * firm.rate : 0;

    const { error } = await (supabase.from('timesheet_entries') as any).insert([{
      firm_id: selectedFirmId, date, start_time: activeTab === 'WORK' ? startTime : "00:00",
      end_time: activeTab === 'WORK' ? endTime : "00:00", total_hours: hours,
      hourly_rate: firm.rate, total_amount: amount, description: finalDesc
    }]);
    if (!error) { setIsEntryModalOpen(false); setDesc(''); fetchData(); }
  };

  // PDF ACTUALIZAT CU PRESTATOR/BENEFICIAR JOS
  const generatePDF = (firm: any) => {
    const firmEntries = entries.filter(e => e.firm_id === firm.id && e.date.startsWith(viewDate));
    if (firmEntries.length === 0) return alert("NU EXISTA DATE!");
    
    const doc = new jsPDF();
    const blueColor = [37, 99, 235]; 

    // Header simplu sus
    doc.setFillColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RAPORT ACTIVITATE", 15, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`LUNA: ${viewDate}`, 15, 18);

    // Tabel central
    autoTable(doc, {
      startY: 35,
      head: [["DATA", "INTERVAL", "ORE", "DESCRIERE ACTIVITATE", "VALOARE"]],
      body: firmEntries.map(e => [
        e.date, 
        e.total_amount > 0 ? `${e.start_time}-${e.end_time}` : "---", 
        e.total_hours.toFixed(2), 
        e.description, 
        `${e.total_amount.toFixed(0)} RON`
      ]),
      headStyles: { fillColor: blueColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 15, right: 15 }
    });

    // Calculăm unde s-a terminat tabelul
    let finalY = (doc as any).lastAutoTable.finalY + 15;
    const totalSuma = firmEntries.reduce((acc, e) => acc + e.total_amount, 0);

    // Verificăm dacă avem loc pe pagină, dacă nu, adăugăm pagină nouă
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    // Sectiunea de Total
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("TOTAL DE INCASAT:", 140, finalY);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.text(`${totalSuma.toFixed(0)} RON`, 140, finalY + 8);

    // Mutăm Prestatorul și Beneficiarul JOS (Footer-ul documentului)
    const footerY = finalY + 40;
    doc.setDrawColor(200, 200, 200);
    doc.setTextColor(40, 40, 40);
    
    // Prestator
    doc.line(15, footerY, 85, footerY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("PRESTATOR (BRIW DESIGN SRL)", 15, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("Semnatura si stampila", 15, footerY + 10);

    // Beneficiar
    doc.line(125, footerY, 195, footerY);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`BENEFICIAR (${firm.name})`, 125, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("Semnatura pentru acceptare", 125, footerY + 10);

    doc.save(`Raport_${firm.name}_${viewDate}.pdf`);
  };

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black italic tracking-widest uppercase">BRIW DESIGN CLOUD...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 pb-32 uppercase font-sans">
      
      {/* STATS HEADER */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
          <button onClick={() => { const d = new Date(viewDate + "-01"); d.setMonth(d.getMonth() - 1); setViewDate(d.toISOString().substring(0, 7)); }}>❮</button>
          <div className="text-center"><p className="text-[9px] text-slate-500 font-black">PERIOADA</p><h1 className="font-black text-xl italic text-blue-500">{viewDate}</h1></div>
          <button onClick={() => { const d = new Date(viewDate + "-01"); d.setMonth(d.getMonth() + 1); setViewDate(d.toISOString().substring(0, 7)); }}>❯</button>
        </div>
        <div className="bg-blue-600 p-6 rounded-[2rem] flex justify-between items-center">
          <div><p className="text-[10px] font-black opacity-70">TOTAL RON</p><h2 className="text-4xl font-black italic">{entries.filter(e => e.date.startsWith(viewDate)).reduce((acc, e) => acc + e.total_amount, 0).toFixed(0)}</h2></div>
        </div>
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-[2rem] flex justify-between items-center">
          <div><p className="text-[10px] font-black text-slate-500">ORE LUNA</p><h2 className="text-4xl font-black italic text-emerald-400">{entries.filter(e => e.date.startsWith(viewDate)).reduce((acc, e) => acc + e.total_hours, 0).toFixed(1)}</h2></div>
        </div>
      </div>

      {/* FIRMS */}
      <div className="max-w-5xl mx-auto space-y-4">
        {firms.map(f => {
          const firmEntries = entries.filter(e => e.firm_id === f.id && e.date.startsWith(viewDate));
          const totalFirma = firmEntries.reduce((acc, e) => acc + e.total_amount, 0);
          return (
            <div key={f.id} className="bg-[#0f172a]/60 border border-slate-800/60 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
              <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800/20 transition-colors" onClick={() => setExpandedFirms(v => ({...v, [f.id]: !v[f.id]}))}>
                <div><h3 className="font-black text-lg">{f.name}</h3><p className="text-[9px] text-slate-500">{f.rate} RON/H</p></div>
                <div className="flex items-center gap-4">
                  <p className="text-2xl font-black text-emerald-400 italic">{totalFirma.toFixed(0)} <span className="text-xs">RON</span></p>
                  <button onClick={(e) => { e.stopPropagation(); generatePDF(f); }} className="p-3 bg-blue-600 rounded-2xl shadow-lg active:scale-95 transition-all"><IconDownload/></button>
                </div>
              </div>
              {expandedFirms[f.id] && (
                <div className="px-8 pb-8 pt-2 space-y-2 border-t border-slate-800/20">
                  {firmEntries.map(e => (
                    <div key={e.id} className="flex justify-between items-center py-3 border-b border-slate-800/10 last:border-0">
                      <div className="flex flex-col"><span className="text-[10px] font-black text-slate-500">{e.date}</span><span className="text-xs font-bold">{e.total_amount > 0 ? `${e.start_time}-${e.end_time}` : 'CONCEDIU'}</span></div>
                      <span className="flex-1 px-8 text-[11px] text-slate-400 italic lowercase truncate">{e.description}</span>
                      <button onClick={async () => { if(confirm("STERGI?")) { await (supabase.from('timesheet_entries') as any).delete().eq('id', e.id); fetchData(); } }} className="text-red-500/20 hover:text-red-500 transition-colors"><IconTrash/></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FLOAT BUTTONS */}
      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-40">
        <button onClick={() => setIsFirmModalOpen(true)} className="bg-slate-800/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-700 font-black text-[10px]"> + CLIENT </button>
        <button onClick={() => setIsEntryModalOpen(true)} className="bg-blue-600 p-6 rounded-[2rem] shadow-2xl font-black italic flex items-center gap-3 text-lg"> <IconPlus/> PONTAJ </button>
      </div>

      {/* MODAL PONTAJ */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <div className="bg-[#0f172a] w-full max-w-md rounded-[3rem] p-8 border border-slate-800 shadow-2xl">
            <div className="flex gap-2 mb-6 bg-black/40 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('WORK')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${activeTab === 'WORK' ? 'bg-blue-600' : 'text-slate-600'}`}>LUCRU</button>
              <button onClick={() => setActiveTab('LEAVE')} className={`flex-1 py-3 rounded-xl font-black text-[10px] ${activeTab === 'LEAVE' ? 'bg-orange-600' : 'text-slate-600'}`}>CONCEDIU</button>
            </div>
            <div className="space-y-4">
              <select className="w-full bg-black/40 p-5 rounded-2xl font-black outline-none border border-slate-800 text-blue-500 appearance-none" value={selectedFirmId} onChange={e => setSelectedFirmId(e.target.value)}>
                <option value="">ALEGE CLIENT</option>
                {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input type="date" className="w-full bg-black/40 p-5 rounded-2xl font-black border border-slate-800" value={date} onChange={e => setDate(e.target.value)}/>
              {activeTab === 'WORK' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setLocation('BIROU')} className={`p-4 rounded-xl font-black text-[10px] border ${location === 'BIROU' ? 'bg-blue-600 border-blue-400' : 'bg-black/20 border-slate-800 text-slate-500'}`}>BIROU</button>
                    <button onClick={() => setLocation('ACASA')} className={`p-4 rounded-xl font-black text-[10px] border ${location === 'ACASA' ? 'bg-blue-600 border-blue-400' : 'bg-black/20 border-slate-800 text-slate-500'}`}>ACASA</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="bg-black/40 p-5 rounded-2xl font-black border border-slate-800" value={startTime} onChange={e => setStartTime(e.target.value)}>{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
                    <select className="bg-black/40 p-5 rounded-2xl font-black border border-slate-800" value={endTime} onChange={e => setEndTime(e.target.value)}>{timeOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                  <textarea className="w-full bg-black/40 p-5 rounded-2xl h-24 text-sm font-bold border border-slate-800 outline-none" placeholder="CE AI LUCRAT?" value={desc} onChange={e => setDesc(e.target.value)}/>
                </>
              ) : (
                <div className="space-y-2">
                  {['CONCEDIU ODIHNA', 'CONCEDIU MEDICAL'].map(t => (
                    <button key={t} onClick={() => setLeaveType(t)} className={`w-full p-4 rounded-xl font-black text-[10px] border ${leaveType === t ? 'bg-orange-600 border-orange-400' : 'bg-black/20 border-slate-800 text-slate-500'}`}>{t}</button>
                  ))}
                </div>
              )}
              <button onClick={handleSaveEntry} className={`w-full py-6 rounded-[2rem] font-black italic text-xl active:scale-95 transition-transform ${activeTab === 'WORK' ? 'bg-blue-600' : 'bg-orange-600'}`}>SALVEAZA</button>
              <button onClick={() => setIsEntryModalOpen(false)} className="w-full text-slate-600 font-black text-[10px] pt-2 tracking-widest">INCHIDE</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENT */}
      {isFirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[3rem] p-10 border border-slate-800 shadow-2xl">
            <h2 className="font-black text-blue-500 mb-8 italic text-2xl tracking-tighter">CLIENT NOU</h2>
            <div className="space-y-4">
              <input className="w-full bg-black/40 p-5 rounded-2xl font-black border border-slate-800" placeholder="NUME COMPANIE" value={fName} onChange={e => setFName(e.target.value)}/>
              <input type="number" className="w-full bg-black/40 p-5 rounded-2xl font-black border border-slate-800" placeholder="TARIF / ORA" value={fRate} onChange={e => setFRate(Number(e.target.value))}/>
              <button onClick={handleSaveFirm} className="w-full bg-emerald-600 py-6 rounded-[2rem] font-black italic text-xl">CONFIRMA</button>
              <button onClick={() => setIsFirmModalOpen(false)} className="w-full text-slate-600 font-black text-[10px] pt-2">INAPOI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}