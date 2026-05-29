import type { StateCreator } from 'zustand';
import type { AppState, CanvasSlice } from './types';

const savedSettings = JSON.parse(localStorage.getItem('react-uml-settings') || '{}');

export const createCanvasSlice: StateCreator<
  AppState,
  [],
  [],
  CanvasSlice
> = (set) => ({
  tool: 'selection',
  zoom: 1,
  pan: { x: 0, y: 0 },
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
  settings: {
    isDarkMode: savedSettings.isDarkMode ?? false,
    isSnappingEnabled: savedSettings.isSnappingEnabled ?? true,
    isRTL: savedSettings.isRTL ?? false,
    groupAlignmentMode: savedSettings.groupAlignmentMode ?? 'separate',
    gridType: savedSettings.gridType ?? 'dot',
    exportScale: savedSettings.exportScale ?? 4,
    exportTransparent: savedSettings.exportTransparent ?? false,
    fontFamily: savedSettings.fontFamily ?? 'system-ui',
    customFonts: savedSettings.customFonts ?? [],
  },
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set((state) => ({ zoom: typeof zoom === 'function' ? zoom(state.zoom) : zoom })),
  setPan: (pan) => set((state) => ({ pan: typeof pan === 'function' ? pan(state.pan) : pan })),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),
  setSettings: (updates) => set(state => {
    const newSettings = { ...state.settings, ...updates };
    localStorage.setItem('react-uml-settings', JSON.stringify(newSettings));
    return { settings: newSettings };
  }),
  addCustomFont: (name, url) => set(state => {
    const newCustomFonts = [...(state.settings.customFonts || []), { name, url }];
    const newSettings = { ...state.settings, customFonts: newCustomFonts, fontFamily: name };
    
    try {
      localStorage.setItem('react-uml-settings', JSON.stringify(newSettings));
    } catch(e) {
      console.warn("Storage quota exceeded. The uploaded font will only be available in this session.");
    }
    
    return { settings: newSettings };
  }),
});