import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Editor } from './pages/Editor';
import { Projects } from './pages/Projects';
import { useStore } from './store/useStore';
import { supabase } from './supabaseClient';

function App() {
  const { settings } = useStore();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settings.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [settings.isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <span className="text-slate-500 font-medium animate-pulse">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={session ? <Navigate to="/projects" replace /> : <Auth />} />
        <Route path="/projects" element={session ? <Projects /> : <Navigate to="/" replace />} />
        <Route path="/editor/:projectId?" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;