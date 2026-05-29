import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Folder, Plus, Clock, FileEdit, LogOut, Loader2, X, Trash2, Sun, Moon, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { settings, setSettings } = useStore();

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

    if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
      alert('File size must not exceed 20MB.');
      return;
    }
    
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ name: newProjectName, user_id: session.user.id }])
        .select()
        .single();

      if (error || !data) {
        alert('Failed to create project. Please try again.');
      } else {
        let finalData = { ...data };
        if (selectedFile) {
          const filePath = `${session.user.id}/${data.id}.json`;
          const { error: uploadError } = await supabase.storage.from('Diagrams').upload(filePath, selectedFile, { contentType: 'application/json', upsert: true });
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('Diagrams').getPublicUrl(filePath);
            await supabase.from('projects').update({ file_url: publicUrl }).eq('id', data.id);
            finalData.file_url = publicUrl;
          }
        }
        
        setProjects([finalData, ...projects]);
        setShowModal(false);
        setNewProjectName('');
        setSelectedFile(null);
      }
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // جلوگیری از باز شدن ناخواسته پروژه
    if (!window.confirm('آیا از حذف این پروژه مطمئن هستید؟')) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // ابتدا فایل‌ها از استوریج حذف شوند
      await supabase.storage.from('Diagrams').remove([`${session.user.id}/${id}.json`, `${session.user.id}/${id}_thumb.png`]);
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 pb-8 font-sans">
        {/* Header */}
        <div className="sticky top-0 z-20 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 rounded-b-2xl shadow-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Folder size={16} />
            </div>
            <h1 className="text-lg font-bold">My Projects</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-colors font-medium text-sm">
              <Plus size={16} /> <span className="hidden sm:inline">New Project</span>
            </button>
            <button onClick={() => setSettings({ isDarkMode: !settings.isDarkMode })} className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              {settings.isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={handleLogout} className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors" title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>

      <div className="mx-auto px-6 pt-8 w-full">
        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <Folder size={48} className="opacity-20" />
            <p>You haven't created any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5">
            {projects.map((proj) => (
              <div 
                key={proj.id} 
                onClick={() => navigate(`/editor/${proj.id}`)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 overflow-hidden group flex flex-col"
              >
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center overflow-hidden relative group/thumb border-b border-slate-100 dark:border-slate-700/50">
                  {proj.thumbnail_url ? (
                    <img src={proj.thumbnail_url} alt={proj.name} className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-slate-300 dark:text-slate-600"><FileEdit size={32} /></div>
                  )}
                </div>
                <div className="flex justify-between items-center p-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-0.5 truncate">{proj.name}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={10} />
                      <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteProject(e, proj.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0" title="Delete Project">
                    <Trash2 size={14} />
                  </button>
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
              <h2 className="font-bold text-lg">New Project</h2>
              <button onClick={() => { setShowModal(false); setSelectedFile(null); setNewProjectName(''); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 flex flex-col gap-4">
              <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Project Name (e.g., E-commerce System)..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" autoFocus required />
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload JSON File (Optional)</label>
                <div className="flex items-center gap-2">
                  <input type="file" accept=".json" id="file-upload" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  <label htmlFor="file-upload" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <Upload size={16} />
                    <span className="truncate max-w-[200px]">{selectedFile ? selectedFile.name : 'Select File'}</span>
                  </label>
                  {selectedFile && (
                    <button type="button" onClick={() => setSelectedFile(null)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button type="button" onClick={() => { setShowModal(false); setSelectedFile(null); setNewProjectName(''); }} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                <button type="submit" disabled={creating || !newProjectName.trim()} className="px-4 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2">{creating && <Loader2 size={16} className="animate-spin" />} {selectedFile ? 'Upload & Create' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};