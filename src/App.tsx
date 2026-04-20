import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      {/* Container principal care previne scroll-ul orizontal pe mobil */}
      <main className="min-h-screen bg-slate-950">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;