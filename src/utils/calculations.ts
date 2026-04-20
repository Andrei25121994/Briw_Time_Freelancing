export function calculateTotalHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const startTotalMinutes = (startHour || 0) * 60 + (startMinute || 0);
  const endTotalMinutes = (endHour || 0) * 60 + (endMinute || 0);
  return Math.max(0, (endTotalMinutes - startTotalMinutes - breakMinutes) / 60);
}

export function formatCurrency(amount: number): string {
  // Aici forțăm afișarea ca monedă RON. NICIODATĂ nu pune style: 'percent' aici.
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(2)} ore`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ro-RO');
}

export function formatTime(timeString: string): string {
  // Returnăm doar primele 5 caractere (HH:mm) pentru a fi siguri
  return timeString ? timeString.slice(0, 5) : '00:00';
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  return months[monthIndex];
}