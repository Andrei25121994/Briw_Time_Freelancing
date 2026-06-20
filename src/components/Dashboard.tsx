import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import DatePicker from './DatePicker';
import { SettingsModal, type AppLanguage, type AppTheme } from './SettingsModal';

type SportSession = {
  id: string;
  date: string;
  activity: string;
  duration_minutes: number;
  notes: string;
};

// IMPROVED ICONS
type IconProps = {
  className?: string;
};

const IconPlus = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconDownload = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IconTrash = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IconChevronLeft = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronRight = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconChevronDown = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconClock = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconDollar = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const IconX = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconSettings = ({ className = '' }: IconProps) => <svg className={`icon-hover ${className}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.2a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01A1.65 1.65 0 0 0 10 3.25V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const pad2 = (value: number) => value.toString().padStart(2, '0');

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
};

const getMonthKeyFromDate = (value: string) => {
  if (/^\d{4}-\d{2}/.test(value)) return value.slice(0, 7);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return getCurrentMonthKey();
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}`;
};

const isEntryInMonth = (entryDate: unknown, monthKey: string) => {
  const value = String(entryDate ?? '');
  const explicitMonth = value.match(/(\d{4})-(\d{2})/);
  if (explicitMonth) {
    return `${explicitMonth[1]}-${explicitMonth[2]}` === monthKey;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}` === monthKey;
};

const shiftMonthKey = (monthKey: string, delta: number) => {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${pad2(shifted.getMonth() + 1)}`;
};

interface DashboardProps {
  userId: string;
  onSignOut: () => Promise<void>;
}

export default function Dashboard({ userId, onSignOut }: DashboardProps) {
  const [firms, setFirms] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [visibleEntries, setVisibleEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(getCurrentMonthKey());
  const [expandedFirms, setExpandedFirms] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleString());
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFirmId, setPdfFirmId] = useState<string | null>(null);
  const [pdfFrom, setPdfFrom] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0];
  });
  const [pdfTo, setPdfTo] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'WORK' | 'LEAVE'>('WORK');
  const [fName, setFName] = useState('');
  const [fRate, setFRate] = useState(70);
  const [editingFirmId, setEditingFirmId] = useState<string | null>(null);
  const [selectedFirmId, setSelectedFirmId] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('BIROU');
  const [leaveType, setLeaveType] = useState('CONCEDIU ODIHNA');
  const [desc, setDesc] = useState('');
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [isSavingFirm, setIsSavingFirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStart, setLeaveStart] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEnd, setLeaveEnd] = useState(new Date().toISOString().split('T')[0]);
  const [leaveReason, setLeaveReason] = useState('VACATION');
  const [leaveDescription, setLeaveDescription] = useState('');
  const [isSavingLeave, setIsSavingLeave] = useState(false);
  const [sportSessions, setSportSessions] = useState<SportSession[]>([]);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [sportDate, setSportDate] = useState(new Date().toISOString().split('T')[0]);
  const [sportActivity, setSportActivity] = useState('GYM');
  const [selectedSportTypes, setSelectedSportTypes] = useState<string[]>(['GYM', 'RUNNING', 'WALKING']);
  const [sportDuration, setSportDuration] = useState(45);
  const [sportNotes, setSportNotes] = useState('');
  const [isSportTimerRunning, setIsSportTimerRunning] = useState(false);
  const [sportTimerSeconds, setSportTimerSeconds] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<AppTheme>('paper');
  const [appLanguage, setAppLanguage] = useState<AppLanguage>('ro');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [sportLoaded, setSportLoaded] = useState(false);
  const [isHeaderSigningOut, setIsHeaderSigningOut] = useState(false);
  const [ownershipClaimed, setOwnershipClaimed] = useState(false);
  const isPaperTheme = appTheme === 'paper';

  const leaveTypes = ['VACATION', 'MEDICAL LEAVE', 'UNPAID LEAVE', 'STUDY LEAVE', 'MATERNITY LEAVE'];
  const sportActivities = ['GYM', 'RUNNING', 'WALKING', 'CYCLING', 'SWIMMING', 'YOGA', 'FOOTBALL', 'BASKETBALL', 'OTHER'];

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    const hh = h < 10 ? `0${h}` : h;
    return `${hh}:${m}`;
  });

  useEffect(() => { fetchData(); }, [viewDate]);
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Load data on component mount
    fetchData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const realtimeChannel = supabase
      .channel(`dashboard-realtime-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'timesheet_entries', filter: `user_id=eq.${userId}` },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'firms', filter: `user_id=eq.${userId}` },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [userId, viewDate]);

  useEffect(() => {
    const loadCloudSettings = async () => {
      if (!userId) return;
      const { data, error: settingsError } = await (supabase.from('app_user_settings') as any)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (settingsError) {
        console.error('Error loading app settings:', settingsError);
      } else if (data) {
        if (data.theme === 'paper' || data.theme === 'ocean' || data.theme === 'sunset' || data.theme === 'forest') setAppTheme(data.theme);
        if (data.language === 'ro' || data.language === 'en' || data.language === 'fr' || data.language === 'de') setAppLanguage(data.language);
        setNotificationsEnabled(Boolean(data.notifications_enabled));
      }
      setSettingsLoaded(true);
    };

    const loadSportSessions = async () => {
      if (!userId) return;
      const { data, error: sportError } = await (supabase.from('sport_sessions') as any)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (sportError) {
        console.error('Error loading sport sessions:', sportError);
      } else if (Array.isArray(data)) {
        setSportSessions(data.map((item: any) => ({
          id: item.id,
          date: item.date,
          activity: item.activity,
          duration_minutes: Number(item.duration_minutes),
          notes: item.notes || '',
        })));
      }
      setSportLoaded(true);
    };

    loadCloudSettings();
    loadSportSessions();
  }, [userId]);

  useEffect(() => {
    if (!settingsLoaded || !userId) return;
    const persistSettings = async () => {
      const { error } = await (supabase.from('app_user_settings') as any).upsert([
        {
          id: userId,
          theme: appTheme,
          language: appLanguage,
          notifications_enabled: notificationsEnabled,
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'id' });

      if (error) console.error('Error saving app settings:', error);
    };

    persistSettings();
    document.body.classList.remove('theme-paper', 'theme-ocean', 'theme-sunset', 'theme-forest');
    document.body.classList.add(`theme-${appTheme}`);
    document.documentElement.lang = appLanguage;
  }, [appTheme, appLanguage, notificationsEnabled, settingsLoaded, userId]);

  useEffect(() => {
    if (!sportLoaded || !userId) return;
    const persistSportSessions = async () => {
      if (sportSessions.length === 0) return;

      const { error: upsertError } = await (supabase.from('sport_sessions') as any).upsert(
        sportSessions.map(session => ({
          id: session.id,
          user_id: userId,
          date: session.date,
          activity: session.activity,
          duration_minutes: session.duration_minutes,
          notes: session.notes,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'id' }
      );

      if (upsertError) console.error('Error saving sport sessions:', upsertError);
    };

    persistSportSessions();
  }, [sportSessions, sportLoaded, userId]);

  useEffect(() => {
    if (!isSportTimerRunning) return;
    const id = setInterval(() => {
      setSportTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isSportTimerRunning]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!notificationsEnabled) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!notificationsEnabled) return;
    if (Notification.permission !== 'granted') return;

    const notifyOncePerDay = (key: string, title: string, body: string, tag: string) => {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `notif_${key}`;
      const lastSent = localStorage.getItem(storageKey);
      if (lastSent === today) return;
      new Notification(title, { body, tag });
      localStorage.setItem(storageKey, today);
    };

    const checkNotifications = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const h = now.getHours();
      const m = now.getMinutes();
      const todayEntries = entries.filter(e => e.date === today);
      const totalTodayHours = todayEntries.reduce((acc, e) => acc + (Number(e.total_hours) || 0), 0);

      if (h === 7 && m === 45 && todayEntries.length === 0) {
        notifyOncePerDay(
          'clock_745',
          'Time to clock in',
          'Good morning. Don\'t forget to log your first work entry.',
          'timesheet-745'
        );
      }

      if (h === 8 && m === 30 && todayEntries.length === 0) {
        notifyOncePerDay(
          'clock_830',
          'Reminder: still not clocked in',
          'Short reminder: please complete your timesheet for today.',
          'timesheet-830'
        );
      }

      if (totalTodayHours >= 8) {
        notifyOncePerDay(
          'sport_after_8h',
          'Great work today',
          'You reached 8h logged. Consider closing the laptop and going for sport or a walk.',
          'timesheet-8h-sport'
        );
      }
    };

    checkNotifications();
    const id = setInterval(checkNotifications, 60000);
    return () => clearInterval(id);
  }, [entries, notificationsEnabled]);

  const changePassword = async (newPassword: string) => {
    const { error: passError } = await supabase.auth.updateUser({ password: newPassword });
    if (passError) throw passError;
  };

  const exportBackup = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      settings: {
        appTheme,
        appLanguage,
        notificationsEnabled,
      },
      firms,
      entries,
      sportSessions,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `timesheet-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const clearSportHistory = () => {
    const confirmed = confirm('Sigur vrei sa stergi istoricul de sport din cloud?');
    if (!confirmed) return;
    setSportSessions([]);
    (async () => {
      await (supabase.from('sport_sessions') as any).delete().eq('user_id', userId);
    })();
  };

  async function claimLegacyData() {
    if (!userId || ownershipClaimed) return;

    const { error: claimEntriesError } = await (supabase.from('timesheet_entries') as any)
      .update({ user_id: userId })
      .is('user_id', null);

    if (claimEntriesError) {
      console.error('Error claiming legacy timesheet entries:', claimEntriesError);
    }

    const { error: claimFirmsError } = await (supabase.from('firms') as any)
      .update({ user_id: userId })
      .is('user_id', null);

    if (claimFirmsError) {
      console.error('Error claiming legacy firms:', claimFirmsError);
    }

    setOwnershipClaimed(true);
  }

  async function fetchMonthEntries(monthKey: string = viewDate) {
    if (!userId) return;
    try {
      const fromDate = `${monthKey}-01`;
      const toDate = `${shiftMonthKey(monthKey, 1)}-01`;
      const { data, error: monthError } = await (supabase.from('timesheet_entries') as any)
        .select('*')
        .eq('user_id', userId)
        .gte('date', fromDate)
        .lt('date', toDate)
        .order('date', { ascending: false });

      if (monthError) {
        console.error('Error fetching month entries:', monthError);
        return;
      }

      if (Array.isArray(data)) setVisibleEntries(data);
    } catch (monthErr) {
      console.error('Unexpected month entries fetch error:', monthErr);
    }
  }

  async function fetchData() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await claimLegacyData();

      const { data: fData, error: fError } = await (supabase.from('firms') as any)
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (fError) {
        console.error('Error fetching firms:', fError);
        setError(`Eroare la încărcarea clienților: ${fError.message || JSON.stringify(fError)}`);
      }
      const { data: eData, error: eError } = await (supabase.from('timesheet_entries') as any)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      if (eError) {
        console.error('Error fetching entries:', eError);
        setError(`Eroare la încărcarea intrărilor: ${eError.message || JSON.stringify(eError)}`);
      }
      if (fData) setFirms(fData);
      if (eData) setEntries(eData);
      await fetchMonthEntries(viewDate);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Eroare neașteptată');
    }
    setLoading(false);
  }

  const handleSaveFirm = async () => {
    if (!fName.trim()) return alert("Te rog introduceți un nume pentru client!");
    if (fRate <= 0) return alert("Rata orară trebuie să fie mai mare de 0!");

    setError(null);
    setIsSavingFirm(true);
    try {
      const { data, error: insertError } = await (supabase.from('firms') as any).insert([
        { name: fName.toUpperCase().trim(), rate: Number(fRate), user_id: userId }
      ]).select();
      
      setIsSavingFirm(false);

      if (insertError) {
        console.error('Error inserting firm:', insertError);
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          setError(`Clientul "${fName}" există deja în baza de date!`);
          alert(`Clientul "${fName}" există deja!`);
        } else {
          setError(`Eroare: ${insertError.message}`);
          alert(`Eroare: ${insertError.message}`);
        }
      } else if (data) {
        // Insert history record (initial rate)
        try {
          await (supabase.from('firm_history') as any).insert([{
            firm_id: data[0].id,
            old_rate: null,
            new_rate: data[0].rate,
            changed_by: 'system'
          }]);
        } catch (histErr) {
          console.warn('Could not insert firm_history:', histErr);
        }

        setFName('');
        setFRate(70);
        setIsFirmModalOpen(false);
        setError(null);
        await fetchData();
        alert('Client adăugat cu succes!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setIsSavingFirm(false);
      setError('Eroare neașteptată la salvarea clientului');
      alert('Eroare neașteptată!');
    }
  };

  const resetEntryForm = () => {
    setSelectedEntryId(null);
    setActiveTab('WORK');
    setSelectedFirmId('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('09:00');
    setEndTime('17:00');
    setLocation('BIROU');
    setLeaveType('CONCEDIU ODIHNA');
    setDesc('');
    setEditingFirmId(null);
  };

  const handleEditEntry = (entry: any) => {
    const parsed = (entry.description || '').match(/^\[([^\]]+)\]\s*(.*)$/);
    const isLeave = entry.total_amount === 0;
    setSelectedEntryId(entry.id);
    setSelectedFirmId(entry.firm_id);
    setDate(entry.date);
    setStartTime(isLeave ? '09:00' : entry.start_time || '09:00');
    setEndTime(isLeave ? '17:00' : entry.end_time || '17:00');
    setLocation(parsed && !isLeave ? parsed[1] : 'BIROU');
    setLeaveType(isLeave ? (parsed?.[1] || 'CONCEDIU ODIHNA') : 'CONCEDIU ODIHNA');
    setDesc(isLeave ? '' : (parsed?.[2] || entry.description || ''));
    setActiveTab(isLeave ? 'LEAVE' : 'WORK');
    setIsEntryModalOpen(true);
  };

  const handleDeleteEntry = async (id: string) => {
    const confirmed = confirm('Ștergi această înregistrare?');
    if (!confirmed) return;
    await (supabase.from('timesheet_entries') as any).delete().eq('id', id).eq('user_id', userId);
    fetchData();
  };

  const handleStartEditFirm = (firm: any) => {
    setEditingFirmId(firm.id);
    setFName(firm.name);
    setFRate(Number(firm.rate));
    setIsFirmModalOpen(true);
  };

  const handleUpdateFirm = async () => {
    if (!editingFirmId) return;
    setIsSavingFirm(true);
    setError(null);
    try {
      const { data: oldFirm } = await (supabase.from('firms') as any).select('*').eq('id', editingFirmId).eq('user_id', userId).single();
      const { error: updErr } = await (supabase.from('firms') as any).update({ name: fName.toUpperCase().trim(), rate: Number(fRate) }).eq('id', editingFirmId).eq('user_id', userId);
      if (updErr) {
        setError(`Eroare: ${updErr.message}`);
        alert(`Eroare: ${updErr.message}`);
        setIsSavingFirm(false);
        return;
      }

      try {
        await (supabase.from('firm_history') as any).insert([{ firm_id: editingFirmId, old_rate: oldFirm?.rate ?? null, new_rate: Number(fRate), changed_by: 'system' }]);
      } catch (hErr) { console.warn('history insert failed', hErr); }

      setIsSavingFirm(false);
      setIsFirmModalOpen(false);
      setEditingFirmId(null);
      await fetchData();
      alert('Client actualizat cu succes!');
    } catch (err) {
      console.error('Unexpected:', err);
      setError('Eroare neașteptată la actualizarea clientului');
      setIsSavingFirm(false);
    }
  };

  const handleCancelEntry = () => {
    resetEntryForm();
    setIsEntryModalOpen(false);
  };

  const handleSaveEntry = async () => {
    const firm = firms.find(f => f.id === selectedFirmId);
    if (!firm) return alert("Te rog alege un client!");
    
    // Check for duplicate entry (same client + date)
    if (!selectedEntryId) {
      const duplicateEntry = entries.find(e => e.firm_id === selectedFirmId && e.date === date);
      if (duplicateEntry) {
        const confirmed = confirm(`You already have an entry for ${firm.name} on ${date}. Are you sure you want to add another one?`);
        if (!confirmed) return;
      }
    }
    
    let finalDesc = activeTab === 'WORK' ? `[${location}] ${desc.toUpperCase() || 'ACTIVITATE'}` : `[${leaveType}]`;
    const [hS, mS] = startTime.split(':').map(Number);
    const [hE, mE] = endTime.split(':').map(Number);
    let diff = (hE * 60 + mE) - (hS * 60 + mS);
    if (diff <= 0) diff += 1440;
    
    const hours = activeTab === 'WORK' ? diff / 60 : 8;
    const amount = activeTab === 'WORK' ? (diff / 60) * firm.rate : 0;
    const entryData = {
      user_id: userId,
      firm_id: selectedFirmId,
      date,
      start_time: activeTab === 'WORK' ? startTime : '00:00',
      end_time: activeTab === 'WORK' ? endTime : '00:00',
      total_hours: hours,
      hourly_rate: firm.rate,
      total_amount: amount,
      description: finalDesc,
    };

    setIsSavingEntry(true);
    setError(null);
    try {
      const response = selectedEntryId
        ? await (supabase.from('timesheet_entries') as any).update(entryData).eq('id', selectedEntryId)
        : await (supabase.from('timesheet_entries') as any).insert([entryData]);
      
      setIsSavingEntry(false);

      if (response.error) {
        console.error('Error saving entry:', response.error);
        setError(`Eroare: ${response.error.message}`);
        alert(`Eroare: ${response.error.message}`);
      } else {
        resetEntryForm();
        setIsEntryModalOpen(false);
        setError(null);
        alert(selectedEntryId ? 'Intrare actualizată cu succes!' : 'Intrare adăugată cu succes!');
        await fetchData();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setIsSavingEntry(false);
      setError('Eroare neașteptată la salvarea intrării');
      alert('Eroare neașteptată!');
    }
  };

  // Generate Leave Request PDF
  const generateLeaveRequestPDF = (reason: string, startDate: string, endDate: string, description: string) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const blueColor: [number, number, number] = [25, 118, 210];
    const reasonMap: Record<string, string> = {
      VACATION: 'concediu de odihna',
      'MEDICAL LEAVE': 'concediu medical',
      'UNPAID LEAVE': 'concediu fara plata',
      'STUDY LEAVE': 'concediu pentru studii',
      'MATERNITY LEAVE': 'concediu de maternitate',
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('ro-RO');
    const today = new Date();
    const normalizedStart = new Date(startDate);
    const normalizedEnd = new Date(endDate);
    const totalDays = Math.floor((normalizedEnd.getTime() - normalizedStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const leaveTypeText = reasonMap[reason] || reason;
    const pageCenterX = 105;

    const drawCenteredLines = (lines: string[], startY: number, lineHeight = 6) => {
      lines.forEach((line, index) => {
        doc.text(line, pageCenterX, startY + index * lineHeight, { align: 'center' });
      });
      return startY + lines.length * lineHeight;
    };

    doc.setFillColor(...blueColor);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('CERERE DE CONCEDIU', pageCenterX, 14, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Data: ${formatDate(today.toISOString().split('T')[0])}`, pageCenterX, 20, { align: 'center' });

    let y = 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    y = drawCenteredLines(['Catre: Domnule Director,'], y, 7);
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    y = drawCenteredLines([
      'Subsemnatul(a), ....................................................,',
      'angajat(a) al societatii BRIW DESIGN SRL,',
    ], y, 7);
    y += 2;

    const requestParagraph = `va rog sa aprobati efectuarea unui ${leaveTypeText} in perioada ${formatDate(startDate)} - ${formatDate(endDate)}, pentru un numar de ${totalDays} zile calendaristice.`;
    const requestLines = doc.splitTextToSize(requestParagraph, 160) as string[];
    y = drawCenteredLines(requestLines, y, 6);
    y += 4;

    if (description.trim()) {
      doc.setFont('helvetica', 'bold');
      y = drawCenteredLines(['Mentiuni:'], y, 6);
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(description.trim(), 160) as string[];
      y = drawCenteredLines(notesLines, y, 6);
      y += 4;
    }

    y = drawCenteredLines(['Va multumesc.'], y, 6);
    y += 14;

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(65, y, 145, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Semnatura solicitant / Aprobat, Director', pageCenterX, y + 6, { align: 'center' });

    doc.save(`Cerere_Concediu_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Handle Leave Request Submission
  const handleSaveLeave = async () => {
    if (!leaveStart || !leaveEnd) return alert('Please select start and end dates');
    if (new Date(leaveStart) > new Date(leaveEnd)) return alert('Start date must be before end date');

    setIsSavingLeave(true);
    setError(null);
    try {
      // Generate PDF
      generateLeaveRequestPDF(leaveReason, leaveStart, leaveEnd, leaveDescription);

      // Get date range and insert entries for all clients
      const startDate = new Date(leaveStart);
      const endDate = new Date(leaveEnd);
      const currentDate = new Date(startDate);

      const entriesToInsert = [];
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Add entry for each client
        for (const firm of firms) {
          entriesToInsert.push({
            user_id: userId,
            firm_id: firm.id,
            date: dateStr,
            start_time: '00:00',
            end_time: '00:00',
            total_hours: 0,
            hourly_rate: firm.rate,
            total_amount: 0,
            description: `[${leaveReason}]`
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (entriesToInsert.length > 0) {
        const { error: insertErr } = await (supabase.from('timesheet_entries') as any).insert(entriesToInsert);
        if (insertErr) {
          console.error('Error inserting leave entries:', insertErr);
          alert(`Error adding leave entries: ${insertErr.message}`);
        } else {
          alert(`Leave request created! ${entriesToInsert.length} entries added across all clients.`);
          await fetchData();
        }
      }

      setIsSavingLeave(false);
      setIsLeaveModalOpen(false);
      setLeaveStart(new Date().toISOString().split('T')[0]);
      setLeaveEnd(new Date().toISOString().split('T')[0]);
      setLeaveReason('VACATION');
      setLeaveDescription('');
    } catch (err) {
      console.error('Error:', err);
      setIsSavingLeave(false);
      alert('Error processing leave request');
    }
  };

  const handleSaveSportSession = () => {
    if (selectedSportTypes.length === 0) return alert('Selecteaza cel putin un tip de sport.');
    if (!sportDate) return alert('Selecteaza data pentru sport.');
    const finalDuration = sportTimerSeconds > 0 ? Math.max(1, Math.round(sportTimerSeconds / 60)) : Number(sportDuration);
    if (!finalDuration || finalDuration <= 0) return alert('Durata sportului trebuie sa fie mai mare decat 0 minute.');

    const session: SportSession = {
      id: crypto.randomUUID(),
      date: sportDate,
      activity: sportActivity,
      duration_minutes: finalDuration,
      notes: sportNotes.trim(),
    };

    setSportSessions(prev => [session, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setIsSportModalOpen(false);
    setSportDate(new Date().toISOString().split('T')[0]);
    setSportActivity('GYM');
    setSelectedSportTypes(['GYM', 'RUNNING', 'WALKING']);
    setSportDuration(45);
    setSportNotes('');
    setIsSportTimerRunning(false);
    setSportTimerSeconds(0);
  };

  const toggleSportType = (activity: string) => {
    setSelectedSportTypes(prev => {
      if (prev.includes(activity)) {
        const next = prev.filter(a => a !== activity);
        if (sportActivity === activity && next.length > 0) {
          setSportActivity(next[0]);
        }
        return next;
      }
      const next = [...prev, activity];
      if (!next.includes(sportActivity)) setSportActivity(activity);
      return next;
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const generatePDFRange = async (firmId: string, from: string, to: string) => {
    const firm = firms.find(f => f.id === firmId);
    if (!firm) return alert('Client does not exist.');

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const firmEntries = entries
      .filter(e => e.firm_id === firmId && new Date(e.date) >= fromDate && new Date(e.date) <= toDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (firmEntries.length === 0) return alert('No records found in the selected period.');

    const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB');
    const nowText = new Date().toLocaleString('en-GB');
    const totalAmount = firmEntries.reduce((acc, e) => acc + e.total_amount, 0);
    const doc = new jsPDF('p', 'mm', 'a4');
    const blueColor: [number, number, number] = [25, 118, 210];

    doc.setFillColor(...blueColor);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TIMESHEET REPORT', 15, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(from)} - ${formatDate(to)}`, 15, 26);
    doc.text(`Generated: ${nowText}`, 15, 32);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Provider:', 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.text('BRIW DESIGN SRL', 15, 45);
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 110, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(firm.name, 110, 45);

    const parseEntry = (entry: any) => {
      const description = entry.description || '';
      const match = description.match(/^\[([^\]]+)\]\s*(.*)$/);
      const rawLocation = match?.[1] || '';
      return {
        location: rawLocation === 'BIROU' ? 'Office' : rawLocation === 'HOME' ? 'Home' : rawLocation,
        comment: match?.[2] || description
      };
    };

    autoTable(doc, {
      startY: 52,
      head: [[
        { content: 'Date', styles: { halign: 'center' } },
        { content: 'Location', styles: { halign: 'center' } },
        { content: 'Time Range', styles: { halign: 'center' } },
        { content: 'Time/Day', styles: { halign: 'center' } },
        { content: 'Comments', styles: { halign: 'center' } }
      ]],
      body: firmEntries.map((entry: any) => {
        const { location, comment } = parseEntry(entry);
        return [
          formatDate(entry.date),
          location,
          entry.total_amount > 0 ? `${entry.start_time} - ${entry.end_time}` : 'Leave',
          entry.total_hours.toFixed(2),
          comment || ' '
        ];
      }),
      headStyles: { fillColor: blueColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3, textColor: 30, minCellHeight: 8 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 42 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 78 }
      },
      margin: { left: 12, right: 12 }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 10;
    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(12, finalY, 198, finalY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Total amount:', 15, finalY + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${totalAmount.toFixed(0)} RON`, 55, finalY + 8);

    const signatureY = finalY + 30;
    doc.line(18, signatureY, 85, signatureY);
    doc.line(125, signatureY, 192, signatureY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Provider signature', 18, signatureY + 6);
    doc.text('Client signature', 125, signatureY + 6);
    doc.save(`Timesheet_${firm.name}_${from}_${to}.pdf`);
  };

  if (loading) return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="animate-spin inline-block">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle></svg>
          </div>
        </div>
        <p className="text-cyan-300 font-bold text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );

  const monthEntries = visibleEntries;
  const totalAmount = monthEntries.reduce((acc, e) => acc + e.total_amount, 0);
  const totalHours = monthEntries.reduce((acc, e) => acc + e.total_hours, 0);
  const isLeaveEntry = (entry: any) => Number(entry?.total_amount) === 0;
  const getEntryDayKey = (entry: any) => {
    const raw = String(entry?.date ?? '');
    const explicit = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (explicit) return explicit[1];
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
  };
  const selectedYear = viewDate.slice(0, 4);
  const leaveDaysThisMonth = new Set(
    monthEntries
      .filter(isLeaveEntry)
      .map(getEntryDayKey)
      .filter(Boolean)
  ).size;
  const leaveDaysThisYear = new Set(
    entries
      .filter(isLeaveEntry)
      .map(getEntryDayKey)
      .filter((dayKey) => Boolean(dayKey) && dayKey.startsWith(`${selectedYear}-`))
  ).size;
  const totalSportMinutes = sportSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalSportHours = totalSportMinutes / 60;

  return (
    <div className="min-h-screen bg-transparent text-white pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl border-b border-blue-300/30 bg-white/70 text-slate-900 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-[0_28px_80px_-36px_rgba(59,130,246,0.8)]">
              <svg viewBox="0 0 64 64" className="h-10 w-10 text-slate-900" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 44L32 22L46 44H18Z" />
                <path d="M24 38H40" />
                <path d="M28 34H36" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-sky-500 via-blue-500 to-orange-400 bg-clip-text text-transparent leading-tight">PONTAJ PRO</h1>
              <p className="text-sm sm:text-base text-slate-600 mt-1">Modern timesheet tracker with 3D UI</p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live clock</p>
            <p className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-sky-500 to-orange-400 bg-clip-text text-transparent tracking-tight">{currentTime}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="group inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-blue-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-600"
              >
                <IconSettings />
                Settings
              </button>
              <button
                onClick={async () => {
                  if (isHeaderSigningOut) return;
                  setIsHeaderSigningOut(true);
                  try {
                    await onSignOut();
                  } finally {
                    setIsHeaderSigningOut(false);
                  }
                }}
                disabled={isHeaderSigningOut}
                className="inline-flex items-center rounded-lg border border-orange-300 bg-orange-500 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-orange-600 disabled:opacity-70"
              >
                {isHeaderSigningOut ? 'Se delogheaza...' : 'Delogare'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Period Selector */}
          <div className="sm:col-span-2 lg:col-span-1 bg-white/80 border border-sky-200 rounded-2xl p-5 flex items-center justify-between hover:border-sky-300 transition-all shadow-sm text-slate-900">
            <button 
              onClick={() => setViewDate((prev) => shiftMonthKey(prev, -1))}
              className="group p-2 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <IconChevronLeft />
            </button>
            <div className="text-center flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Period</p>
                <div className="max-w-[180px] mx-auto">
                  <DatePicker value={`${viewDate}-01`} onChange={(v) => setViewDate(getMonthKeyFromDate(v))} />
                </div>
              </div>
            <button 
              onClick={() => setViewDate((prev) => shiftMonthKey(prev, 1))}
              className="group p-2 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <IconChevronRight />
            </button>
          </div>

          {/* Total RON */}
          <div className="sm:col-span-1 bg-white/80 border border-sky-200 rounded-2xl p-5 hover:border-sky-300 transition-all shadow-sm text-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <IconDollar />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Income</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalAmount.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-1">RON</p>
          </div>

          {/* Total Hours */}
          <div className="sm:col-span-1 bg-white/80 border border-sky-200 rounded-2xl p-5 hover:border-sky-300 transition-all shadow-sm text-slate-900">
            <div className="flex items-center gap-2 mb-2">
              <IconClock />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Hours</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-slate-500 mt-1">Hours</p>
          </div>

          {/* Clients Count */}
          <div className="sm:col-span-2 lg:col-span-1 bg-white/80 border border-sky-200 rounded-2xl p-5 hover:border-sky-300 transition-all shadow-sm text-slate-900">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Active Clients</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-500">{firms.length}</p>
            <p className="text-xs text-slate-500 mt-1">Clients</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-200 bg-white/80 p-5 shadow-sm text-slate-900">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Libere in luna selectata</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">{leaveDaysThisMonth}</p>
            <p className="text-xs text-slate-500 mt-1">zile</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-white/80 p-5 shadow-sm text-slate-900">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Libere in anul selectat ({selectedYear})</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-orange-500">{leaveDaysThisYear}</p>
            <p className="text-xs text-slate-500 mt-1">zile</p>
          </div>
        </div>

        {/* SPORT HISTORY */}
        <div className="mb-8 rounded-2xl border border-sky-200 bg-white/80 p-5 shadow-sm text-slate-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-600">Sport History</h3>
              <p className="text-xs text-slate-500">Track how often you exercise and total effort.</p>
            </div>
            <button
              onClick={() => setIsSportModalOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Add Sport Session
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total sessions</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{sportSessions.length}</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total time</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{totalSportMinutes} min</p>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Total hours</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{totalSportHours.toFixed(1)} h</p>
            </div>
          </div>

          <div className="space-y-2">
            {sportSessions.length === 0 ? (
              <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-slate-500">
                No sport sessions logged yet.
              </p>
            ) : (
              sportSessions.slice(0, 8).map(session => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-sky-200 bg-white p-3 text-slate-900 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{session.activity}</p>
                    <p className="text-xs text-slate-500">{session.date}{session.notes ? ` • ${session.notes}` : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">{session.duration_minutes} min</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FIRMS LIST */}
        <div className="space-y-4">
          {firms.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-slate-900/40 to-slate-800/20 border border-slate-700/30 rounded-2xl">
              <p className="text-slate-400 font-medium mb-4">No clients yet</p>
              <button 
                onClick={() => setIsFirmModalOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold text-sm transition-colors"
              >
                <IconPlus /> Add Your First Client
              </button>
            </div>
          ) : (
            firms.map(f => {
              const firmEntries = monthEntries.filter(e => e.firm_id === f.id);
              const totalFirma = firmEntries.reduce((acc, e) => acc + e.total_amount, 0);
              const totalHoursFirm = firmEntries.reduce((acc, e) => acc + e.total_hours, 0);
              return (
                <div 
                  key={f.id} 
                  className="bg-sky-100/35 backdrop-blur-sm border border-sky-200/80 rounded-2xl overflow-hidden hover:border-sky-300 transition-all shadow-sm"
                >
                  {/* FIRM HEADER */}
                  <button
                    onClick={() => setExpandedFirms(v => ({...v, [f.id]: !v[f.id]}))}
                    className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-sky-200/35 transition-colors group text-slate-900"
                  >
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{f.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-sky-200/70 text-blue-700 px-2 py-1 rounded font-medium">{f.rate} RON/H</span>
                        <span className="text-xs text-slate-500">{firmEntries.length} entries</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-emerald-500">{totalFirma.toFixed(0)} <span className="text-xs text-slate-500">RON</span></p>
                        <p className="text-xs text-slate-500">{totalHoursFirm.toFixed(1)}h</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {firmEntries.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setPdfFirmId(f.id); setPdfFrom(`${viewDate}-01`); setPdfTo(new Date().toISOString().split('T')[0]); setIsPdfModalOpen(true); }}
                            className="group p-3 bg-blue-500/15 hover:bg-blue-500/25 border border-sky-300/60 rounded-xl transition-all text-blue-600 hover:text-blue-700"
                            title="Download PDF"
                          >
                            <IconDownload/>
                          </button>
                        )}
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleStartEditFirm(f); }} className="group p-2 text-orange-500 hover:text-orange-600 rounded-lg bg-orange-500/10 border border-orange-200/70" title="Edit client">
                            Edit
                          </button>
                          <div className={`p-3 rounded-xl transition-transform ${ expandedFirms[f.id] ? 'bg-sky-200/70 text-blue-700' : 'text-slate-500' }`}>
                            <IconChevronDown className={`transform transition-transform ${expandedFirms[f.id] ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* EXPANDED ENTRIES */}
                  {expandedFirms[f.id] && (
                    <div className="border-t border-sky-200/80 px-5 sm:px-6 py-4 bg-white/65 space-y-3 max-h-96 overflow-y-auto text-slate-900">
                      {firmEntries.length === 0 ? (
                        <p className="text-center text-slate-500 py-6 text-sm">No entries for this period</p>
                      ) : (
                        firmEntries.map(e => (
                          <div 
                            key={e.id} 
                            className="flex items-start justify-between gap-3 p-3 sm:p-4 bg-sky-50/80 border border-sky-200/80 rounded-lg hover:border-sky-300 transition-all group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-blue-700 bg-sky-200/80 px-2 py-1 rounded">{e.date}</span>
                                {e.total_amount > 0 && (
                                  <span className="text-xs text-slate-500">{e.start_time} - {e.end_time}</span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 italic truncate">{e.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <span className="text-blue-700 font-semibold">{e.total_hours.toFixed(2)}h</span>
                                <span className="text-emerald-600 font-semibold">{e.total_amount.toFixed(0)} RON</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditEntry(e)}
                                className="group p-2 bg-white/80 hover:bg-sky-100 text-slate-700 rounded-lg transition-all border border-sky-200"
                                title="Edit entry"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteEntry(e.id)}
                                className="group p-2 text-red-500/60 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Delete entry"
                              >
                                <IconTrash/>
                              </button>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); handleStartEditFirm(f); }}
                                className="group p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 rounded-lg transition-all"
                                title="Edit client"
                              >
                                Edit Client
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setIsFirmModalOpen(true)}
          className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 text-white font-bold text-sm"
          title="Add Client"
        >
          <span className="inline-block text-lg transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-90">+</span>
        </button>
        <button 
          onClick={() => setIsLeaveModalOpen(true)}
          className="group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 active:scale-95 text-white font-bold text-sm"
          title="Leave Request"
        >
          <svg className="icon-hover" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"></path><line x1="12" y1="12" x2="12" y2="19"></line><polyline points="19 16 12 19 5 16"></polyline></svg>
        </button>
        <button 
          onClick={() => { resetEntryForm(); setIsEntryModalOpen(true); }}
          className="group flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-2xl hover:shadow-2xl transition-all transform hover:scale-110 active:scale-95 text-white font-bold text-lg"
          title="Add Entry"
        >
          <IconPlus/>
        </button>
      </div>

      {/* LEAVE REQUEST MODAL */}
      {isLeaveModalOpen && (
        <div onClick={() => setIsLeaveModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className={`my-auto w-full max-w-md rounded-3xl shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto ${isPaperTheme ? 'bg-white/95 border border-sky-200 text-slate-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 text-white'}`}>
            <div className={`sticky top-0 px-6 py-4 flex items-center justify-between ${isPaperTheme ? 'bg-white/90 border-b border-sky-200' : 'bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-700/50'}`}>
              <h2 className={`text-lg sm:text-2xl font-bold ${isPaperTheme ? 'text-blue-600' : 'bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent'}`}>Leave Request</h2>
              <button onClick={() => setIsLeaveModalOpen(false)} className={`group p-2 rounded ${isPaperTheme ? 'hover:bg-sky-100 text-slate-700' : 'hover:bg-slate-800'}`}><IconX/></button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className={`p-4 rounded-lg text-sm ${isPaperTheme ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-500/20 border border-red-500/50 text-red-300'}`}>{error}</div>
              )}

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Leave Type</label>
                <select 
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 ${isPaperTheme ? 'bg-white border border-sky-200 text-slate-900' : 'bg-slate-800/40 border border-slate-700/50 text-white'}`}
                >
                  {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Start Date</label>
                  <DatePicker value={leaveStart} onChange={setLeaveStart} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">End Date</label>
                  <DatePicker value={leaveEnd} onChange={setLeaveEnd} />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Notes (Optional)</label>
                <textarea 
                  value={leaveDescription}
                  onChange={e => setLeaveDescription(e.target.value)}
                  placeholder="Add any notes about your leave..."
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 h-20 resize-none ${isPaperTheme ? 'bg-white border border-sky-200 text-slate-900 placeholder-slate-400' : 'bg-slate-800/40 border border-slate-700/50 text-white'}`}
                />
              </div>

              <div className={`grid grid-cols-2 gap-3 pt-4 ${isPaperTheme ? 'border-t border-sky-200' : 'border-t border-slate-700/30'}`}>
                <button 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className={`py-3 px-4 font-bold rounded-lg transition-all ${isPaperTheme ? 'bg-white hover:bg-sky-100 border border-sky-200 text-slate-700' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-slate-300'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveLeave}
                  disabled={isSavingLeave}
                  className={`py-3 px-4 font-bold rounded-lg text-white transition-all disabled:opacity-70 ${isPaperTheme ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800'}`}
                >
                  {isSavingLeave ? 'Processing...' : 'Create & Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPORT MODAL */}
      {isSportModalOpen && (
        <div onClick={() => setIsSportModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className="my-auto w-full max-w-md rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
              <h3 className="text-lg font-bold text-cyan-300">Add Sport Session</h3>
              <button onClick={() => setIsSportModalOpen(false)} className="group rounded p-2 hover:bg-slate-800"><IconX /></button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Date</label>
                <DatePicker value={sportDate} onChange={setSportDate} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Sport types (select multiple)</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {sportActivities.map(activity => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleSportType(activity)}
                      className={`rounded-lg border px-2 py-2 text-xs font-bold transition-all ${selectedSportTypes.includes(activity) ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : 'border-slate-700/50 bg-slate-800/40 text-slate-300 hover:bg-slate-800/70'}`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Sport you do now</label>
                <select
                  value={sportActivity}
                  onChange={(e) => setSportActivity(e.target.value)}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {selectedSportTypes.length === 0 ? (
                    <option value="">Select sport types first</option>
                  ) : (
                    selectedSportTypes.map(activity => <option key={activity} value={activity}>{activity}</option>)
                  )}
                </select>
              </div>

              <div className="rounded-xl border border-cyan-500/20 bg-cyan-900/10 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-cyan-200">Timer</label>
                <p className="text-3xl font-black tracking-widest text-cyan-300">{formatTimer(sportTimerSeconds)}</p>
                <p className="mt-1 text-xs text-slate-400">When timer is used, duration is auto-calculated at save.</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSportTimerRunning(true)}
                    className="rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Start
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSportTimerRunning(false)}
                    className="rounded-lg bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsSportTimerRunning(false); setSportTimerSeconds(0); }}
                    className="rounded-lg bg-slate-700 py-2 text-xs font-bold text-white hover:bg-slate-600"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sportDuration}
                  onChange={(e) => setSportDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-300">Notes</label>
                <textarea
                  value={sportNotes}
                  onChange={(e) => setSportNotes(e.target.value)}
                  placeholder="Ex: cardio + stretching"
                  className="h-20 w-full resize-none rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3 font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setIsSportModalOpen(false)} className="rounded-lg border border-slate-700/50 bg-slate-800/40 py-3 font-bold text-slate-300 hover:bg-slate-800/70">Cancel</button>
                <button onClick={handleSaveSportSession} className="rounded-lg bg-cyan-600 py-3 font-bold text-white hover:bg-cyan-700">Save Session</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF MODAL */}
      {isPdfModalOpen && (
        <div onClick={() => setIsPdfModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-gradient-to-br from-slate-900 to-slate-950 my-auto w-full max-w-md rounded-3xl sm:rounded-3xl border border-slate-700/50 shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-700/50">
              <h3 className="text-lg font-bold">Generate PDF Report</h3>
              <button onClick={() => setIsPdfModalOpen(false)} className="group p-2 rounded hover:bg-slate-800"><IconX/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-2">Select Client</label>
                <select value={pdfFirmId||''} onChange={e=>setPdfFirmId(e.target.value)} className="w-full bg-slate-800/40 border border-slate-700/50 text-white px-4 py-3 rounded-lg">
                  <option value="">-- alege client --</option>
                  {firms.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-2">From</label>
                  <DatePicker value={pdfFrom} onChange={setPdfFrom} />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-2">To</label>
                  <DatePicker value={pdfTo} onChange={setPdfTo} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={()=>setIsPdfModalOpen(false)} className="px-4 py-2 bg-slate-800/40 rounded-lg">Cancel</button>
                <button onClick={()=>{ if(!pdfFirmId) return alert('Alege client'); generatePDFRange(pdfFirmId!, pdfFrom, pdfTo); setIsPdfModalOpen(false); }} className="px-4 py-2 bg-emerald-600 rounded-lg text-white">Generate PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PONTAJ - IMPROVED */}
      {isEntryModalOpen && (
        <div onClick={() => setIsEntryModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()} className={`my-auto w-full max-w-2xl rounded-3xl sm:rounded-3xl shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto ${isPaperTheme ? 'bg-white/95 border border-sky-200 text-slate-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 text-white'}`}>
            {/* MODAL HEADER */}
            <div className={`sticky top-0 px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between ${isPaperTheme ? 'bg-white/90 border-b border-sky-200' : 'bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-700/50'}`}>
              <h2 className={`text-lg sm:text-2xl font-bold ${isPaperTheme ? 'text-blue-600' : 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'}`}>{selectedEntryId ? 'Update Entry' : 'Add Entry'}</h2>
              <button 
                onClick={handleCancelEntry}
                className={`group p-2 rounded-lg transition-colors ${isPaperTheme ? 'hover:bg-sky-100 text-slate-700' : 'hover:bg-slate-800'}`}
              >
                <IconX />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-5 sm:p-8 space-y-6">
              {error && (
                <div className={`p-4 rounded-lg text-sm ${isPaperTheme ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-500/20 border border-red-500/50 text-red-300'}`}>
                  {error}
                </div>
              )}
              
              {/* TAB SELECTION */}
              <div className={`grid grid-cols-2 gap-3 rounded-xl p-1.5 ${isPaperTheme ? 'bg-sky-50 border border-sky-200' : 'bg-slate-800/30 border border-slate-700/30'}`}>
                <button 
                  onClick={() => setActiveTab('WORK')} 
                  className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'WORK' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : isPaperTheme ? 'text-slate-600 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  WORK
                </button>
                <button 
                  onClick={() => setActiveTab('LEAVE')} 
                  className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'LEAVE' ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' : isPaperTheme ? 'text-slate-600 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  LEAVE
                </button>
              </div>

              {/* CLIENT SELECTION */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Select Client</label>
                <select 
                  value={selectedFirmId} 
                  onChange={e => setSelectedFirmId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                >
                  <option value="">Choose a client...</option>
                  {firms.map(f => <option key={f.id} value={f.id}>{f.name} ({f.rate} RON/H)</option>)}
                </select>
              </div>

              {/* DATE SELECTION */}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Date</label>
                <DatePicker value={date} onChange={setDate} />
              </div>

              {/* WORK TAB */}
              {activeTab === 'WORK' ? (
                <>
                  {/* LOCATION SELECTION */}
                  <div>
                    <label className={`block text-xs font-bold mb-3 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Location</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['OFFICE', 'HOME'].map(loc => (
                        <button 
                          key={loc}
                          onClick={() => setLocation(loc)} 
                          className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${location === loc ? isPaperTheme ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-blue-600/30 border-blue-500 text-blue-300' : isPaperTheme ? 'bg-white border-sky-200 text-slate-600 hover:text-slate-800 hover:bg-sky-50' : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TIME SELECTION */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Start Time</label>
                      <select 
                        value={startTime} 
                        onChange={e => setStartTime(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                      >
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>End Time</label>
                      <select 
                        value={endTime} 
                        onChange={e => setEndTime(e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                      >
                        {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>What did you work on?</label>
                    <textarea 
                      value={desc} 
                      onChange={e => setDesc(e.target.value)}
                      placeholder="Describe your work..."
                      className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24 resize-none ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 placeholder-slate-400' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                    />
                  </div>
                </>
              ) : (
                /* LEAVE TAB */
                <div>
                  <label className={`block text-xs font-bold mb-3 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Leave Type</label>
                  <div className="space-y-2">
                    {['VACATION', 'MEDICAL LEAVE'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setLeaveType(t)} 
                        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all border text-left ${leaveType === t ? isPaperTheme ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-orange-600/30 border-orange-500 text-orange-300' : isPaperTheme ? 'bg-white border-sky-200 text-slate-600 hover:text-slate-800 hover:bg-sky-50' : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className={`grid grid-cols-2 gap-3 pt-4 ${isPaperTheme ? 'border-t border-sky-200' : 'border-t border-slate-700/30'}`}>
                <button 
                  onClick={handleCancelEntry}
                  className={`py-3 px-4 font-bold rounded-lg transition-all ${isPaperTheme ? 'bg-white hover:bg-sky-100 border border-sky-200 text-slate-700' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-slate-300'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEntry}
                  disabled={isSavingEntry}
                  className={`py-3 px-4 font-bold rounded-lg text-white transition-all ${activeTab === 'WORK' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'} ${isSavingEntry ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSavingEntry ? (selectedEntryId ? 'Updating...' : 'Saving...') : (selectedEntryId ? 'Update Entry' : 'Save Entry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENT - IMPROVED */}
      {isFirmModalOpen && (
        <div onClick={() => setIsFirmModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-3 sm:p-4">
          <div onClick={(e) => e.stopPropagation()} className={`my-auto w-full max-w-md rounded-3xl sm:rounded-3xl shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto ${isPaperTheme ? 'bg-white/95 border border-sky-200 text-slate-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 text-white'}`}>
            {/* MODAL HEADER */}
            <div className={`px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between ${isPaperTheme ? 'bg-white/90 border-b border-sky-200' : 'bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-700/50'}`}>
              <h2 className={`text-lg sm:text-2xl font-bold ${isPaperTheme ? 'text-blue-600' : 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'}`}>{editingFirmId ? 'Edit Client' : 'Add Client'}</h2>
              <button 
                onClick={() => setIsFirmModalOpen(false)}
                className={`group p-2 rounded-lg transition-colors ${isPaperTheme ? 'hover:bg-sky-100 text-slate-700' : 'hover:bg-slate-800'}`}
              >
                <IconX />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 sm:p-8 space-y-5">
              {error && (
                <div className={`p-4 rounded-lg text-sm ${isPaperTheme ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-red-500/20 border border-red-500/50 text-red-300'}`}>
                  {error}
                </div>
              )}
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Company Name</label>
                <input 
                  type="text"
                  placeholder="e.g., ACME Corporation"
                  value={fName} 
                  onChange={e => setFName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 placeholder-slate-400' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : 'text-slate-300'}`}>Hourly Rate (RON)</label>
                <input 
                  type="number" 
                  placeholder="70"
                  min="0.01"
                  step="0.01"
                  value={fRate} 
                  onChange={e => setFRate(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isPaperTheme ? 'bg-white hover:bg-sky-50 border border-sky-200 text-slate-900 placeholder-slate-400' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-white'}`}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className={`grid grid-cols-2 gap-3 pt-4 ${isPaperTheme ? 'border-t border-sky-200' : 'border-t border-slate-700/30'}`}>
                <button 
                  onClick={() => { setIsFirmModalOpen(false); setError(null); }}
                  className={`py-3 px-4 font-bold rounded-lg transition-all ${isPaperTheme ? 'bg-white hover:bg-sky-100 border border-sky-200 text-slate-700' : 'bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 text-slate-300'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={editingFirmId ? handleUpdateFirm : handleSaveFirm}
                  disabled={isSavingFirm || !fName.trim() || fRate <= 0}
                  className={`py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-lg transition-all ${
                    isSavingFirm || !fName.trim() || fRate <= 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSavingFirm ? (editingFirmId ? 'Updating...' : 'Adding...') : (editingFirmId ? 'Update Client' : 'Add Client')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={appTheme}
        language={appLanguage}
        notificationsEnabled={notificationsEnabled}
        onThemeChange={setAppTheme}
        onLanguageChange={setAppLanguage}
        onNotificationsToggle={setNotificationsEnabled}
        onChangePassword={changePassword}
        onExportBackup={exportBackup}
        onClearSportSessions={clearSportHistory}
        onSignOut={onSignOut}
      />
    </div>
  );
}