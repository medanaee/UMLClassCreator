import type { StateCreator } from 'zustand';
import type { AppState, HistorySlice, UmlClassType } from './types';

export const createHistorySlice: StateCreator<
  AppState,
  [],
  [],
  HistorySlice
> = (set) => ({
  past: [],
  future: [],
  commitHistory: () => set(state => {
    const stripForComparison = (cls: UmlClassType) => {
      if (cls.type === 'comment') {
        const { height, width, ...rest } = cls;
        return rest;
      }
      const { height, ...rest } = cls;
      return rest;
    };

    const currentStateStr = JSON.stringify({ classes: state.classes.map(stripForComparison), arrows: state.arrows });
    const lastPast = state.past[state.past.length - 1];
    const lastStateStr = lastPast ? JSON.stringify({ classes: lastPast.classes.map(stripForComparison), arrows: lastPast.arrows }) : '';
    if (currentStateStr === lastStateStr) return {};
    
    const hash = Math.random().toString(36).substring(2, 9);
    console.groupCollapsed(`[History] Committed snapshot with hash: ${hash} | Items: ${state.classes.length} classes, ${state.arrows.length} arrows`);

    if (lastPast) {
      const addedClasses = state.classes.filter(c => !lastPast.classes.find(lc => lc.id === c.id));
      const removedClasses = lastPast.classes.filter(lc => !state.classes.find(c => c.id === lc.id));
      const modifiedClasses = state.classes.filter(c => {
        const prev = lastPast.classes.find(lc => lc.id === c.id);
        return prev && JSON.stringify(stripForComparison(prev)) !== JSON.stringify(stripForComparison(c));
      });

      if (addedClasses.length) console.log('%c+ Added Classes:', 'color: #10b981', addedClasses);
      if (removedClasses.length) console.log('%c- Removed Classes:', 'color: #ef4444', removedClasses);
      if (modifiedClasses.length) console.log('%c~ Modified Classes:', 'color: #f59e0b', modifiedClasses);
    } else {
      console.log('Initial State');
    }
    console.groupEnd();

    const past = [...state.past, { classes: state.classes, arrows: state.arrows }].slice(-50);
    return { past, future: [] };
  }),
  undo: () => set(state => {
    if (state.past.length <= 1) return state;
    const current = state.past[state.past.length - 1];
    const previous = state.past[state.past.length - 2];
    const newPast = state.past.slice(0, -1);
    
    // حذف خودکار المان‌هایی که طول یا عرضشان کمتر از ۵ است
    const filteredClasses = previous.classes.filter(c => c.width >= 5 && (c.height || 0) >= 5);

    return {
      classes: filteredClasses,
      arrows: previous.arrows,
      past: newPast,
      future: [current, ...state.future],
      selectedIds: []
    };
  }),
  redo: () => set(state => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      classes: next.classes,
      arrows: next.arrows,
      past: [...state.past, next],
      future: newFuture,
      selectedIds: []
    };
  }),
});