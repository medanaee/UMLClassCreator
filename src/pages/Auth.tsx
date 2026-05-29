import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Hexagon, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/projects');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Registration successful. You can now log in (or check your email for a verification link if required).');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
          <Hexagon size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          {isLogin ? 'Sign In' : 'Create an Account'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 text-center">
          Sign in to save and manage your diagrams in the cloud.
        </p>

        {error && (
          <div className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4 text-center border border-red-200 dark:border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 mt-4 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>

        <div className="w-full flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          <span className="text-xs text-slate-400 font-medium">OR</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
        >
          Continue as Guest <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};