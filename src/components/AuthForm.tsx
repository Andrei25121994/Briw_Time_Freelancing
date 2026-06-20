import { useState } from 'react';
import { Clock } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (identifier: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, username: string) => Promise<void>;
  onVerifyCode: (email: string, code: string) => Promise<void>;
}

export function AuthForm({ onSignIn, onSignUp, onVerifyCode }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState<'credentials' | 'verify'>('credentials');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const authPanelKey = `${isSignUp ? 'signup' : 'signin'}-${signUpStep}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (signUpStep === 'credentials') {
          await onSignUp(email, password, username);
          setSignUpStep('verify');
          setInfo('Ti-am trimis un cod pe email. Introdu codul pentru activarea contului.');
        } else {
          await onVerifyCode(email, code);
          setInfo('Cont verificat. Te poti autentifica acum cu email/username si parola.');
          setIsSignUp(false);
          setSignUpStep('credentials');
          setIdentifier(email);
          setCode('');
        }
      } else {
        await onSignIn(identifier, password);
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100 flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="auth-orb auth-orb-blue" />
        <div className="auth-orb auth-orb-cyan" />
        <div className="auth-orb auth-orb-indigo" />
      </div>

      <div key={authPanelKey} className={`auth-card bg-white/90 backdrop-blur rounded-2xl shadow-2xl border border-blue-100 p-8 w-full max-w-md relative z-10 ${hasStartedEditing ? '' : 'auth-card-idle-float'}`}>
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full shadow-lg shadow-blue-500/30">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Pontaj Manager
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isSignUp
            ? signUpStep === 'credentials'
              ? 'Creeaza cont nou'
              : 'Verifica email-ul'
            : 'Autentifica-te in contul tau'}
        </p>

        {info && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            {info}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          onFocusCapture={() => setHasStartedEditing(true)}
          onPointerDownCapture={() => setHasStartedEditing(true)}
          className="space-y-4"
        >
          {!isSignUp && (
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email sau Username
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 caret-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="exemplu@email.com sau username"
              />
            </div>
          )}

          {isSignUp && signUpStep === 'credentials' && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 caret-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 caret-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemplu@email.com"
                />
              </div>
            </>
          )}

          {isSignUp && signUpStep === 'verify' && (
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Cod verificare din email
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 caret-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123456"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Parola
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-slate-900 caret-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {loading
              ? 'Se proceseaza...'
              : isSignUp
                ? signUpStep === 'credentials'
                  ? 'Trimite cod pe email'
                  : 'Verifica codul'
                : 'Autentificare'}
          </button>

          {isSignUp && signUpStep === 'verify' && (
            <button
              type="button"
              onClick={async () => {
                setError('');
                setInfo('');
                setLoading(true);
                try {
                  await onSignUp(email, password, username);
                  setInfo('Am retrimis codul de verificare pe email.');
                } catch (err: any) {
                  setError(err.message || 'Nu am putut retrimite codul.');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full text-blue-700 font-medium py-2 px-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Retrimite cod
            </button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSignUpStep('credentials');
              setError('');
              setInfo('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isSignUp ? 'Ai deja cont? Autentifica-te' : 'Nu ai cont? Creeaza unul'}
          </button>
        </div>
      </div>
    </div>
  );
}
