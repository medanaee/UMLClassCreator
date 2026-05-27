import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronDown, ChevronRight, Box, ArrowRight, ArrowLeft, FileText, Type, Hexagon, Layers, Settings, Sun, Moon, Combine } from 'lucide-react';
import { Slider } from './Slider';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
      checked ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const LeftPanel: React.FC = () => {
  const { classes, arrows, isLeftPanelOpen, selectedIds, selectElement, settings, setSettings, addCustomFont } = useStore();
  const [activeTab, setActiveTab] = useState('layers');
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
  const [expandedLayerGroups, setExpandedLayerGroups] = useState<Record<string, boolean>>({});

  if (!isLeftPanelOpen) return null;

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGroupExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLayerGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const tabBtnClass = (isActive: boolean) => `flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-blue-500 dark:text-blue-400 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'}`;

  const renderClassNode = (cls: any) => {
      const isExpanded = expandedClasses[cls.id];
      const isSelected = selectedIds.includes(cls.id);
      const outgoing = arrows.filter(a => a.start.attachedTo === cls.id);
      const incoming = arrows.filter(a => a.end.attachedTo === cls.id);
      return (
        <div key={cls.id} className="flex flex-col">
          <div 
            onClick={(e) => selectElement(cls.id, e.ctrlKey || e.metaKey, true)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm font-medium transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            <button onClick={(e) => toggleExpand(cls.id, e)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded">
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {cls.type === 'polygon' ? <Hexagon size={14} className={isSelected ? "text-blue-500" : "text-pink-500"} /> : cls.type === 'comment' ? <Type size={14} className={isSelected ? "text-blue-500" : "text-purple-500"} /> : cls.type === 'text' ? <FileText size={14} className={isSelected ? "text-blue-500" : "text-amber-500"} /> : <Box size={14} className={isSelected ? "text-blue-500" : "text-slate-400"} />}
            <span className="truncate">{cls.name || 'Unnamed Class'}</span>
          </div>

          {isExpanded && (
            <div className="pl-8 pr-2 py-1 flex flex-col gap-1.5 border-l border-slate-200 dark:border-slate-700 ml-4 mb-2">
              {outgoing.length === 0 && incoming.length === 0 && (
                <div className="text-[11px] text-slate-400 italic">No connections</div>
              )}

              {outgoing.map(arr => {
                const targetCls = classes.find(c => c.id === arr.end.attachedTo);
                const isLine = arr.type === 'line';
                return (
                  <div key={`out-${arr.id}`} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400" title={`Relationship: ${arr.type}`}>
                    {isLine ? <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500 flex-shrink-0 mx-[1px]" /> : <ArrowRight size={12} className="text-emerald-500 flex-shrink-0" />}
                    <span className="font-mono text-[9px] px-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 capitalize truncate max-w-[60px]">{arr.type}</span>
                    <span className="truncate">{targetCls ? targetCls.name : 'Unconnected'}</span>
                  </div>
                );
              })}

              {incoming.map(arr => {
                const sourceCls = classes.find(c => c.id === arr.start.attachedTo);
                const isLine = arr.type === 'line';
                return (
                  <div key={`in-${arr.id}`} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400" title={`Relationship: ${arr.type}`}>
                    {isLine ? <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-500 flex-shrink-0 mx-[1px]" /> : <ArrowLeft size={12} className="text-rose-500 flex-shrink-0" />}
                    <span className="font-mono text-[9px] px-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 capitalize truncate max-w-[60px]">{arr.type}</span>
                    <span className="truncate">{sourceCls ? sourceCls.name : 'Unconnected'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="absolute top-[65px] left-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-[80] shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300">
      <div className="border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur z-10">
        <div className="flex">
          <button onClick={() => setActiveTab('layers')} className={tabBtnClass(activeTab === 'layers')}>
            <Layers size={14} /> Layers
          </button>
          <button onClick={() => setActiveTab('settings')} className={tabBtnClass(activeTab === 'settings')}>
            <Settings size={14} /> Settings
          </button>
        </div>
      </div>
      <div className="overflow-y-auto">
      {activeTab === 'layers' && (
        <div className="p-2 flex flex-col gap-1">
        {classes.length === 0 && (
           <div className="text-xs text-slate-400 p-2 text-center">No classes yet.</div>
        )}
        {(() => {
           const rootClasses = classes.filter(c => !c.groupId);
           const groups = classes.reduce((acc, cls) => {
               if (cls.groupId) {
                   if (!acc[cls.groupId]) acc[cls.groupId] = [];
                   acc[cls.groupId].push(cls);
               }
               return acc;
           }, {} as Record<string, typeof classes>);
           
           let groupIndex = 1;
           
           return (
             <>
               {Object.entries(groups).map(([groupId, groupItems]) => {
                  const isGroupExpanded = expandedLayerGroups[groupId] ?? true;
                  const isGroupSelected = groupItems.every(c => selectedIds.includes(c.id));
                  
                  return (
                    <div key={groupId} className="flex flex-col mb-1">
                        <div 
                            onClick={(e) => selectElement(groupItems[0].id, e.ctrlKey || e.metaKey)}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm font-bold transition-colors ${isGroupSelected ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                        >
                            <button onClick={(e) => toggleGroupExpand(groupId, e)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded">
                                {isGroupExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                            <Combine size={14} className={isGroupSelected ? "text-blue-500" : "text-slate-500"} />
                            <span>Group {groupIndex++}</span>
                        </div>
                        {isGroupExpanded && (
                            <div className="pl-4 flex flex-col gap-1 mt-1 border-l border-slate-100 dark:border-slate-700/50 ml-4">
                                {groupItems.map(cls => renderClassNode(cls))}
                            </div>
                        )}
                    </div>
                  );
               })}
               {rootClasses.map(cls => renderClassNode(cls))}
             </>
           )
        })()}
      </div>
      )}
      {activeTab === 'settings' && (
        <div className="p-4 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Appearance</h3>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label htmlFor="dark-mode-toggle" className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {settings.isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
                Dark Mode
              </label>
              <ToggleSwitch 
                checked={settings.isDarkMode} 
                onChange={() => setSettings({ isDarkMode: !settings.isDarkMode })} 
              />
            </div>

            <div className="flex flex-col gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => setSettings({ fontFamily: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded px-2 py-1.5 text-sm outline-none text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="system-ui">System Default</option>
                <option value="VazirmatnLocal">Vazirmatn</option>
                <option value="NewCMLocal">New Computer Modern</option>
                <option value="FiraLocal">Fira Code</option>
                <option value="InterLocal">Inter</option>
                {settings.customFonts?.map(font => (
                  <option key={font.name} value={font.name}>{font.name}</option>
                ))}
              </select>
              <div className="mt-1">
                <label className="text-xs font-bold text-blue-500 cursor-pointer hover:underline flex items-center gap-1">
                  + Upload Custom Font (TTF)
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '') + '-' + Math.floor(Math.random() * 1000);
                        addCustomFont(fontName, ev.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Editor</h3>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label htmlFor="snapping-toggle" className="font-medium text-slate-700 dark:text-slate-300">
                Enable Snapping
              </label>
              <ToggleSwitch 
                checked={settings.isSnappingEnabled} 
                onChange={() => setSettings({ isSnappingEnabled: !settings.isSnappingEnabled })} 
              />
            </div>

            <div className="flex flex-col gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Group Alignment Mode</label>
              <div className="flex gap-1">
                {['separate', 'together'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ groupAlignmentMode: mode as any })}
                    className={`flex-1 py-1.5 text-xs rounded border capitalize transition-colors font-medium ${settings.groupAlignmentMode === mode ? 'bg-slate-200 border-slate-400 text-slate-800 dark:bg-slate-600 dark:text-white dark:border-slate-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Canvas</h3>
            <div className="flex flex-col gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Grid Style</label>
              <div className="flex gap-1">
                {['dot', 'grid', 'none'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSettings({ gridType: type as any })}
                    className={`flex-1 py-1.5 text-xs rounded border capitalize transition-colors font-medium ${settings.gridType === type ? 'bg-slate-200 border-slate-400 text-slate-800 dark:bg-slate-600 dark:text-white dark:border-slate-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Export Options</h3>
            <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Transparent Background
              </label>
              <ToggleSwitch 
                checked={settings.exportTransparent} 
                onChange={() => setSettings({ exportTransparent: !settings.exportTransparent })} 
              />
            </div>
            <div className="flex flex-col gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Scale / Quality</label>
                <span className="text-xs font-mono text-slate-500">{settings.exportScale}x</span>
              </div>
              <Slider 
                min={1} 
                max={8} 
                step={1} 
                value={settings.exportScale} 
                onChange={(e) => setSettings({ exportScale: parseInt(e.target.value) })} 
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};