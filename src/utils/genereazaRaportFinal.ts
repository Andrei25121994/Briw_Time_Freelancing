// Fișier: generateReport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function genereazaRaportFinal(data: any) {
  const { entries, month, year, userName } = data;
  const doc = new jsPDF('p', 'mm', 'a4');

  // 1. Calcul matematic manual, fără dependențe
  const totalAmount = entries.reduce((sum: number, e: any) => sum + (Number(e.total_amount) || 0), 0);

  // 2. Titlu
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('RAPORT ACTIVITATE', 105, 15, { align: 'center' });

  // 3. Datele tabelului - CURĂȚATE total de orice simboluri
  const tableData = entries.map((e: any) => [
    String(e.date || '-'),
    String(e.start_time || '00:00'),
    String(e.total_hours || '0') + 'h',
    String(e.total_amount || '0') + ' RON',
    String(e.description || '-').replace(/[^a-zA-Z0-9 ]/g, " ") // ELIMINĂ TOT CE NU E LITERĂ SAU CIFRĂ
  ]);

  // 4. Tabel FĂRĂ FOOTER (am șters orice setare de foot)
  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Interval', 'Ore', 'Suma', 'Detalii']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 9 }
  });

  // 5. TOTAL scris manual, fără nicio legătură cu tabelul
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL DE PLATA: ${totalAmount.toFixed(2)} RON`, 14, finalY);

  // 6. Salvare
  doc.save(`Raport_${month}_${year}.pdf`);
}