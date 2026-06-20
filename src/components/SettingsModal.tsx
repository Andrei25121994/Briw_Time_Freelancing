import { useMemo, useState } from 'react';

export type AppTheme = 'paper' | 'ocean' | 'sunset' | 'forest';
export type AppLanguage = 'ro' | 'en' | 'fr' | 'de';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  language: AppLanguage;
  notificationsEnabled: boolean;
  onThemeChange: (value: AppTheme) => void;
  onLanguageChange: (value: AppLanguage) => void;
  onNotificationsToggle: (value: boolean) => void;
  onChangePassword: (newPassword: string) => Promise<void>;
  onExportBackup: () => void;
  onClearSportSessions: () => void;
  onSignOut: () => Promise<void>;
}

const copy = {
  ro: {
    title: 'Setari aplicatie',
    close: 'Inchide',
    theme: 'Tema',
    language: 'Limba',
    notifications: 'Notificari desktop',
    password: 'Schimba parola',
    newPassword: 'Parola noua',
    confirmPassword: 'Confirma parola',
    savePassword: 'Salveaza parola',
    savedPassword: 'Parola a fost actualizata.',
    mismatch: 'Parolele nu coincid.',
    minLength: 'Parola trebuie sa aiba minim 8 caractere.',
    data: 'Date si siguranta',
    export: 'Export backup JSON',
    clearSport: 'Sterge istoricul sport din cloud',
    signOut: 'Logout',
    processing: 'Se proceseaza...'
  },
  en: {
    title: 'App settings',
    close: 'Close',
    theme: 'Theme',
    language: 'Language',
    notifications: 'Desktop notifications',
    password: 'Change password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    savePassword: 'Save password',
    savedPassword: 'Password updated successfully.',
    mismatch: 'Passwords do not match.',
    minLength: 'Password must contain at least 8 characters.',
    data: 'Data and security',
    export: 'Export JSON backup',
    clearSport: 'Clear cloud sport history',
    signOut: 'Sign out',
    processing: 'Processing...'
  },
  fr: {
    title: 'Parametres application',
    close: 'Fermer',
    theme: 'Theme',
    language: 'Langue',
    notifications: 'Notifications bureau',
    password: 'Changer le mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    savePassword: 'Enregistrer le mot de passe',
    savedPassword: 'Mot de passe mis a jour.',
    mismatch: 'Les mots de passe ne correspondent pas.',
    minLength: 'Le mot de passe doit contenir au moins 8 caracteres.',
    data: 'Donnees et securite',
    export: 'Exporter sauvegarde JSON',
    clearSport: 'Effacer l historique sport cloud',
    signOut: 'Se deconnecter',
    processing: 'Traitement...'
  },
  de: {
    title: 'App-Einstellungen',
    close: 'Schliessen',
    theme: 'Design',
    language: 'Sprache',
    notifications: 'Desktop-Benachrichtigungen',
    password: 'Passwort andern',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestaetigen',
    savePassword: 'Passwort speichern',
    savedPassword: 'Passwort wurde aktualisiert.',
    mismatch: 'Passwoerter stimmen nicht ueberein.',
    minLength: 'Passwort muss mindestens 8 Zeichen haben.',
    data: 'Daten und Sicherheit',
    export: 'JSON-Backup exportieren',
    clearSport: 'Cloud-Sportverlauf loeschen',
    signOut: 'Abmelden',
    processing: 'Wird verarbeitet...'
  }
} as const;

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  language,
  notificationsEnabled,
  onThemeChange,
  onLanguageChange,
  onNotificationsToggle,
  onChangePassword,
  onExportBackup,
  onClearSportSessions,
  onSignOut,
}: SettingsModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const t = useMemo(() => copy[language], [language]);
  const isPaperTheme = theme === 'paper';
  const isOceanTheme = theme === 'ocean';
  const isSunsetTheme = theme === 'sunset';

  const darkShellClasses = isSunsetTheme
    ? 'border border-rose-900/60 bg-gradient-to-br from-rose-950 via-orange-950 to-zinc-950 text-rose-50'
    : isOceanTheme
      ? 'border border-cyan-900/60 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 text-cyan-50'
      : 'border border-emerald-900/60 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-emerald-50';
  const darkHeaderClasses = isSunsetTheme
    ? 'border-b border-rose-900/60 bg-rose-950/80'
    : isOceanTheme
      ? 'border-b border-cyan-900/60 bg-slate-950/85'
      : 'border-b border-emerald-900/60 bg-emerald-950/80';
  const darkTitleClasses = isSunsetTheme
    ? 'text-orange-300'
    : isOceanTheme
      ? 'text-cyan-300'
      : 'text-emerald-300';
  const darkPanelClasses = isSunsetTheme
    ? 'border border-rose-900/50 bg-rose-950/35'
    : isOceanTheme
      ? 'border border-slate-700/40 bg-slate-900/40'
      : 'border border-emerald-900/50 bg-emerald-950/25';
  const darkPanelTitleClasses = isSunsetTheme
    ? 'text-rose-200/90'
    : isOceanTheme
      ? 'text-slate-300'
      : 'text-emerald-200/90';
  const darkNeutralButtonClasses = isSunsetTheme
    ? 'border border-rose-900/60 text-rose-200 hover:bg-rose-950/60'
    : isOceanTheme
      ? 'border border-slate-700 text-slate-300 hover:bg-slate-800/70'
      : 'border border-emerald-900/60 text-emerald-200 hover:bg-emerald-950/50';
  const darkInputClasses = isSunsetTheme
    ? 'border border-rose-900/60 bg-rose-950/35 text-rose-50 placeholder-rose-300/50'
    : isOceanTheme
      ? 'border border-slate-700/50 bg-slate-800/50 text-white'
      : 'border border-emerald-900/60 bg-emerald-950/25 text-emerald-50 placeholder-emerald-300/50';

  if (!isOpen) return null;

  const handlePasswordUpdate = async () => {
    setFeedback('');
    if (newPassword.length < 8) {
      setFeedback(t.minLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback(t.mismatch);
      return;
    }

    setIsSavingPassword(true);
    try {
      await onChangePassword(newPassword);
      setFeedback(t.savedPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setFeedback(error?.message || 'Error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
      <div onClick={(e) => e.stopPropagation()} className={`my-auto w-full max-w-xl rounded-3xl shadow-2xl max-h-[calc(100dvh-1.5rem)] overflow-y-auto ${isPaperTheme ? 'border border-sky-200 bg-white/95 text-slate-900' : darkShellClasses}`}>
        <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur ${isPaperTheme ? 'border-b border-sky-200 bg-white/90' : darkHeaderClasses}`}>
          <h2 className={`text-xl font-bold ${isPaperTheme ? 'text-blue-600' : darkTitleClasses}`}>{t.title}</h2>
          <button onClick={onClose} className={`rounded-lg px-3 py-1.5 text-sm ${isPaperTheme ? 'border border-sky-200 text-slate-700 hover:bg-sky-100' : darkNeutralButtonClasses}`}>{t.close}</button>
        </div>

        <div className="space-y-6 p-6">
          <section className={`rounded-xl p-4 ${isPaperTheme ? 'border border-sky-200 bg-sky-50/70' : darkPanelClasses}`}>
            <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : darkPanelTitleClasses}`}>{t.theme}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button onClick={() => onThemeChange('paper')} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${theme === 'paper' ? 'border-sky-400 bg-sky-500/20 text-blue-700' : isPaperTheme ? 'border-sky-200 text-slate-700 hover:bg-sky-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800/70'}`}>White paper</button>
              <button onClick={() => onThemeChange('ocean')} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${theme === 'ocean' ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : isPaperTheme ? 'border-sky-200 text-slate-700 hover:bg-sky-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800/70'}`}>Ocean</button>
              <button onClick={() => onThemeChange('sunset')} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${theme === 'sunset' ? 'border-orange-400 bg-orange-500/20 text-orange-200' : isPaperTheme ? 'border-sky-200 text-slate-700 hover:bg-sky-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800/70'}`}>Sunset</button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button onClick={() => onThemeChange('forest')} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${theme === 'forest' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : isPaperTheme ? 'border-sky-200 text-slate-700 hover:bg-sky-100' : 'border-slate-700 text-slate-300 hover:bg-slate-800/70'}`}>Forest</button>
              <div className={`rounded-lg px-3 py-2 text-xs ${isPaperTheme ? 'border border-sky-200 bg-white text-slate-600' : darkNeutralButtonClasses}`}>
                Accents stay blue and orange for action buttons.
              </div>
            </div>
          </section>

          <section className={`rounded-xl p-4 ${isPaperTheme ? 'border border-sky-200 bg-sky-50/70' : darkPanelClasses}`}>
            <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : darkPanelTitleClasses}`}>{t.language}</h3>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as AppLanguage)}
              className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isPaperTheme ? 'border border-sky-200 bg-white text-slate-800' : darkInputClasses}`}
            >
              <option value="ro">Romana</option>
              <option value="en">English</option>
              <option value="fr">Francais</option>
              <option value="de">Deutsch</option>
            </select>

            <label className={`mt-4 flex items-center justify-between rounded-lg px-3 py-2 ${isPaperTheme ? 'border border-sky-200 bg-white' : darkInputClasses}`}>
              <span className={`text-sm ${isPaperTheme ? 'text-slate-700' : darkPanelTitleClasses}`}>{t.notifications}</span>
              <input type="checkbox" checked={notificationsEnabled} onChange={(e) => onNotificationsToggle(e.target.checked)} className="h-4 w-4" />
            </label>
          </section>

          <section className={`rounded-xl p-4 ${isPaperTheme ? 'border border-sky-200 bg-sky-50/70' : darkPanelClasses}`}>
            <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : darkPanelTitleClasses}`}>{t.password}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.newPassword}
                className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isPaperTheme ? 'border border-sky-200 bg-white text-slate-800 placeholder-slate-400' : darkInputClasses}`}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t.confirmPassword}
                className={`rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${isPaperTheme ? 'border border-sky-200 bg-white text-slate-800 placeholder-slate-400' : darkInputClasses}`}
              />
            </div>
            <button
              onClick={handlePasswordUpdate}
              disabled={isSavingPassword}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {isSavingPassword ? t.processing : t.savePassword}
            </button>
            {feedback && <p className={`mt-2 text-sm ${isPaperTheme ? 'text-slate-600' : darkPanelTitleClasses}`}>{feedback}</p>}
          </section>

          <section className={`rounded-xl p-4 ${isPaperTheme ? 'border border-sky-200 bg-sky-50/70' : darkPanelClasses}`}>
            <h3 className={`mb-3 text-xs font-bold uppercase tracking-wider ${isPaperTheme ? 'text-slate-600' : darkPanelTitleClasses}`}>{t.data}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button onClick={onExportBackup} className={`rounded-lg px-3 py-2 text-sm font-semibold ${isPaperTheme ? 'border border-sky-200 text-blue-700 bg-white hover:bg-sky-100' : darkNeutralButtonClasses}`}>{t.export}</button>
              <button onClick={onClearSportSessions} className={`rounded-lg px-3 py-2 text-sm font-semibold ${isPaperTheme ? 'border border-orange-200 text-orange-600 bg-white hover:bg-orange-50' : 'border border-orange-700/70 text-orange-300 hover:bg-orange-500/10'}`}>{t.clearSport}</button>
            </div>
            <button
              onClick={async () => {
                setIsSigningOut(true);
                try {
                  await onSignOut();
                } finally {
                  setIsSigningOut(false);
                }
              }}
              disabled={isSigningOut}
              className={`mt-3 w-full rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-70 ${isPaperTheme ? 'border border-red-200 text-red-600 bg-white hover:bg-red-50' : 'border border-red-700/70 text-red-300 hover:bg-red-500/10'}`}
            >
              {isSigningOut ? t.processing : t.signOut}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
