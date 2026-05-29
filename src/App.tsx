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
    const styleId = 'custom-fonts-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    let css = `
      body, .font-sans { font-family: 'InterLocal', sans-serif !important; }
      @font-face { font-family: 'VazirmatnLocal'; src: url('/fonts/Vazirmatn/Vazirmatn-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; }
      @font-face { font-family: 'VazirmatnLocal'; src: url('/fonts/Vazirmatn/Vazirmatn-Bold.ttf') format('truetype'); font-weight: bold; font-style: normal; }
      
      @font-face { font-family: 'NewCMLocal'; src: url('/fonts/NewCM/NewCM10-Book.otf') format('opentype'); font-weight: normal; font-style: normal; }
      @font-face { font-family: 'NewCMLocal'; src: url('/fonts/NewCM/NewCM10-Bold.otf') format('opentype'); font-weight: bold; font-style: normal; }
      @font-face { font-family: 'NewCMLocal'; src: url('/fonts/NewCM/NewCM10-BookItalic.otf') format('opentype'); font-weight: normal; font-style: italic; }
      @font-face { font-family: 'NewCMLocal'; src: url('/fonts/NewCM/NewCM10-BoldItalic.otf') format('opentype'); font-weight: bold; font-style: italic; }

      @font-face { font-family: 'FiraLocal'; src: url('/fonts/Fira/FiraCode-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; }
      @font-face { font-family: 'FiraLocal'; src: url('/fonts/Fira/FiraCode-Bold.ttf') format('truetype'); font-weight: bold; font-style: normal; }

      @font-face { font-family: 'InterLocal'; src: url('/fonts/Inter/Inter_18pt-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; }
      @font-face { font-family: 'InterLocal'; src: url('/fonts/Inter/Inter_18pt-Bold.ttf') format('truetype'); font-weight: bold; font-style: normal; }
      @font-face { font-family: 'InterLocal'; src: url('/fonts/Inter/Inter_18pt-Italic.ttf') format('truetype'); font-weight: normal; font-style: italic; }
      @font-face { font-family: 'InterLocal'; src: url('/fonts/Inter/Inter_18pt-BoldItalic.ttf') format('truetype'); font-weight: bold; font-style: italic; }
    `;

    (settings.customFonts || []).forEach(font => {
      css += `\n@font-face { font-family: '${font.name}'; src: url('${font.url}'); }`;
    });

    styleEl.innerHTML = css;
  }, [settings.customFonts]);

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
        <span className="text-slate-500 font-medium animate-pulse">Loading...</span>
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