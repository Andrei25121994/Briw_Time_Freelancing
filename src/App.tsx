import Dashboard from './components/Dashboard';
import { AuthForm } from './components/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading, signIn, signUp, verifySignUpCode } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-slate-200 text-sm uppercase tracking-wider">Se verifica sesiunea...</div>
      </main>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} onVerifyCode={verifySignUpCode} />;
  }

  return (
    <div className="App">
      <main className="min-h-screen bg-transparent">
        <Dashboard userId={user.id} />
      </main>
    </div>
  );
}

export default App;