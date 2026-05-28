import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Folder, Plus, Clock, FileEdit, LogOut, Loader2, X } from 'lucide-react';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate('/');
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProjectName, user_id: session.user.id }])
        .select()
        .single();

      if (!error && data) {
        setProjects([data, ...projects]);
        setShowModal(false);
        setNewProjectName('');
      } else {
        alert('خطا در ایجاد پروژه. لطفاً دوباره تلاش کنید.');
      }
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Folder size={20} />
            </div>
            <h1 className="text-xl font-bold">پروژه‌های من</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm">
              <Plus size={16} /> پروژه جدید
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors font-medium text-sm">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Folder size={48} className="opacity-20" />
            <p>هنوز هیچ پروژه‌ای نساخته‌اید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                onClick={() => navigate(`/editor/${proj.id}`)}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:-translate-y-1 group flex flex-col gap-4"
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <FileEdit size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1 truncate">{proj.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock size={12} />
                    <span dir="ltr">{new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
              <h2 className="font-bold text-lg">ایجاد پروژه جدید</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 flex flex-col gap-4">
              <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="نام پروژه (مثلاً: سیستم فروشگاه)..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" autoFocus required />
              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">انصراف</button>
                <button type="submit" disabled={creating || !newProjectName.trim()} className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2">{creating && <Loader2 size={16} className="animate-spin" />} ایجاد پروژه</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};