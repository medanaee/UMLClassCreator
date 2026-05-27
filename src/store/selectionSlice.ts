import type { StateCreator } from 'zustand';
import type { AppState, SelectionSlice, UmlClassType, UmlArrowType } from './types';

export const createSelectionSlice: StateCreator<
  AppState,
  [],
  [],
  SelectionSlice
> = (set, get) => ({
  groupSelected: () => {
    set(state => {
      if (state.selectedIds.length < 2) return state;
      const newGroupId = 'group-' + Date.now();
      return {
        classes: state.classes.map(c => state.selectedIds.includes(c.id) ? { ...c, groupId: newGroupId } : c),
        arrows: state.arrows.map(a => state.selectedIds.includes(a.id) ? { ...a, groupId: newGroupId } : a)
      };
    });
    get().commitHistory();
  },

  ungroupSelected: () => {
    set(state => {
      const groupIdsToUngroup = new Set<string>();
      state.classes.forEach(c => { if (state.selectedIds.includes(c.id) && c.groupId) groupIdsToUngroup.add(c.groupId); });
      state.arrows.forEach(a => { if (state.selectedIds.includes(a.id) && a.groupId) groupIdsToUngroup.add(a.groupId); });
      if (groupIdsToUngroup.size === 0) return state;
      return {
        classes: state.classes.map(c => c.groupId && groupIdsToUngroup.has(c.groupId) ? { ...c, groupId: undefined } : c),
        arrows: state.arrows.map(a => a.groupId && groupIdsToUngroup.has(a.groupId) ? { ...a, groupId: undefined } : a)
      };
    });
    get().commitHistory();
  },

  removeFromGroup: () => {
    set(state => {
      if (state.selectedIds.length === 0) return state;
      return {
        classes: state.classes.map(c => state.selectedIds.includes(c.id) ? { ...c, groupId: undefined } : c),
        arrows: state.arrows.map(a => state.selectedIds.includes(a.id) ? { ...a, groupId: undefined } : a)
      };
    });
    get().commitHistory();
  },

    selectElement: (id, multi = false, subSelect = false) => set(state => {
        if (id === null) return { selectedIds: [], alignKeyId: null };

        // Find the clicked item and its group ID
        const clickedClass = state.classes.find(c => c.id === id);
        const clickedArrow = state.arrows.find(a => a.id === id);
        const clickedGroupId = clickedClass?.groupId || clickedArrow?.groupId;

        // Determine if we are currently in a "sub-selection" mode within a single group
        let isSubSelectingGroup: string | null = null;
        if (state.selectedIds.length > 0) {
            const firstSelectedId = state.selectedIds[0];
            const firstItem = state.classes.find(c => c.id === firstSelectedId) || state.arrows.find(a => a.id === firstSelectedId);
            const firstGroupId = firstItem?.groupId;

            if (firstGroupId) {
                // Check if all currently selected items belong to the same group
                const allInSameGroup = state.selectedIds.every(sid => {
                    const item = state.classes.find(c => c.id === sid) || state.arrows.find(a => a.id === sid);
                    return item?.groupId === firstGroupId;
                });
                if (allInSameGroup) {
                    isSubSelectingGroup = firstGroupId;
                }
            }
        }

        let idsToSelect = [id];

        if (clickedGroupId && !subSelect && clickedGroupId !== isSubSelectingGroup) {
            const groupClassIds = state.classes.filter(c => c.groupId === clickedGroupId).map(c => c.id);
            const groupArrowIds = state.arrows.filter(a => a.groupId === clickedGroupId).map(a => a.id);
            idsToSelect = [...groupClassIds, ...groupArrowIds];
        }

        if (multi) {
            const isAlreadySelected = idsToSelect.every(x => state.selectedIds.includes(x));
            if (isAlreadySelected) {
                const newIds = state.selectedIds.filter(x => !idsToSelect.includes(x));
                return { selectedIds: newIds, alignKeyId: newIds.includes(state.alignKeyId || '') ? state.alignKeyId : null };
            } else {
                return { selectedIds: Array.from(new Set([...state.selectedIds, ...idsToSelect])) };
            }
        }
        return { selectedIds: idsToSelect, alignKeyId: null };
    }),

  openContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),

  copySelected: () => set((state) => {
    const selectedClasses = state.classes.filter(c => state.selectedIds.includes(c.id));
    const selectedArrows = state.arrows.filter(a => state.selectedIds.includes(a.id));
    if (selectedClasses.length === 0 && selectedArrows.length === 0) return state;
    return { clipboard: { type: 'mixed', data: JSON.parse(JSON.stringify({ classes: selectedClasses, arrows: selectedArrows })) } };
  }),

  pasteFromClipboard: (x, y) => {
    set((state) => {
      if (!state.clipboard || state.clipboard.type !== 'mixed') return state;
      const clipData = state.clipboard.data;
      if (clipData.classes.length === 0 && clipData.arrows.length === 0) return state;

      let minX = Infinity, minY = Infinity;
      clipData.classes.forEach((c: any) => { minX = Math.min(minX, c.x); minY = Math.min(minY, c.y); });
      clipData.arrows.forEach((a: any) => { minX = Math.min(minX, a.start.x, a.end.x); minY = Math.min(minY, a.start.y, a.end.y); });

      const dx = x - (minX !== Infinity ? minX : 0);
      const dy = y - (minY !== Infinity ? minY : 0);

      const newClasses: UmlClassType[] = [];
      const newArrows: UmlArrowType[] = [];
      const idMap: Record<string, string> = {};

      clipData.classes.forEach((c: any) => {
        const newId = 'class-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        idMap[c.id] = newId;
        newClasses.push({ ...c, id: newId, x: c.x + dx, y: c.y + dy, items: c.items.map((i: any) => ({ ...i, id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000) })) });
      });

      clipData.arrows.forEach((a: any) => {
        const newId = 'arrow-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        newArrows.push({ ...a, id: newId, start: { ...a.start, attachedTo: idMap[a.start.attachedTo || ''] || null, x: a.start.x + dx, y: a.start.y + dy }, end: { ...a.end, attachedTo: idMap[a.end.attachedTo || ''] || null, x: a.end.x + dx, y: a.end.y + dy }, controlPoints: (a.controlPoints || []).map((cp: any) => ({ x: cp.x + dx, y: cp.y + dy })) });
      });

      return { classes: [...state.classes, ...newClasses], arrows: [...state.arrows, ...newArrows], selectedIds: [...newClasses.map(c => c.id), ...newArrows.map(a => a.id)], contextMenu: null };
    });
    get().commitHistory();
  },

  duplicateSelected: () => {
    set((state) => {
      const newClasses: UmlClassType[] = [];
      const newArrows: UmlArrowType[] = [];
      const idMap: Record<string, string> = {};

      const selectedClasses = state.classes.filter(c => state.selectedIds.includes(c.id));
      const selectedArrows = state.arrows.filter(a => state.selectedIds.includes(a.id));

      selectedClasses.forEach(c => {
        const newId = 'class-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        idMap[c.id] = newId;
        newClasses.push({ ...c, id: newId, x: c.x + 20, y: c.y + 20, items: c.items.map(i => ({ ...i, id: 'item-' + Date.now() + '-' + Math.floor(Math.random() * 1000) })) });
      });

      selectedArrows.forEach(a => {
        const newId = 'arrow-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        newArrows.push({ ...a, id: newId, start: { ...a.start, attachedTo: idMap[a.start.attachedTo || ''] || null, x: a.start.x + 20, y: a.start.y + 20 }, end: { ...a.end, attachedTo: idMap[a.end.attachedTo || ''] || null, x: a.end.x + 20, y: a.end.y + 20 }, controlPoints: (a.controlPoints || []).map(cp => ({ x: cp.x + 20, y: cp.y + 20 })) });
      });

      return { classes: [...state.classes, ...newClasses], arrows: [...state.arrows, ...newArrows], selectedIds: [...newClasses.map(c => c.id), ...newArrows.map(a => a.id)], contextMenu: null };
    });
    get().commitHistory();
  },

  deleteSelected: () => {
    set((state) => ({
      classes: state.classes.filter(c => !state.selectedIds.includes(c.id)),
      arrows: state.arrows.filter(a => !state.selectedIds.includes(a.id)).map(a => ({ ...a, start: state.selectedIds.includes(a.start.attachedTo || '') ? { ...a.start, attachedTo: null } : a.start, end: state.selectedIds.includes(a.end.attachedTo || '') ? { ...a.end, attachedTo: null } : a.end })),
      selectedIds: [], contextMenu: null,
    }));
    get().commitHistory();
  },

  setAlignKeyId: (id) => set({ alignKeyId: id }),

  alignSelected: (type) => set((state) => {
    const selectedClassIds = state.selectedIds.filter(id => state.classes.some(c => c.id === id));
    const selectedClasses = state.classes.filter(c => selectedClassIds.includes(c.id));
    
    // دسته‌بندی بر اساس منطق تنظیمات (گروهی یا مجزا)
    const unitsMap = new Map<string, UmlClassType[]>();
    selectedClasses.forEach(c => {
      const key = (state.settings.groupAlignmentMode === 'together' && c.groupId) ? c.groupId : c.id;
      if (!unitsMap.has(key)) unitsMap.set(key, []);
      unitsMap.get(key)!.push(c);
    });

    // محاسبه ابعاد هر واحد (Unit)
    const units = Array.from(unitsMap.entries()).map(([key, clsList]) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      clsList.forEach(c => {
        minX = Math.min(minX, c.x);
        minY = Math.min(minY, c.y);
        maxX = Math.max(maxX, c.x + c.width);
        maxY = Math.max(maxY, c.y + (c.height || 100));
      });
      return { id: key, classes: clsList, x: minX, y: minY, width: maxX - minX, height: Math.max(1, maxY - minY) };
    });

    if (units.length < 2) return state; // حداقل دو واحد برای تراز کردن لازم است

    let refBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    
    if (state.alignKeyId && selectedClassIds.includes(state.alignKeyId)) { 
      const keyClass = state.classes.find(c => c.id === state.alignKeyId)!; 
      const keyUnitKey = (state.settings.groupAlignmentMode === 'together' && keyClass.groupId) ? keyClass.groupId : keyClass.id;
      const keyUnit = units.find(u => u.id === keyUnitKey)!;
      refBounds = { minX: keyUnit.x, minY: keyUnit.y, maxX: keyUnit.x + keyUnit.width, maxY: keyUnit.y + keyUnit.height }; 
    } else { 
      units.forEach(u => { 
        refBounds.minX = Math.min(refBounds.minX, u.x); 
        refBounds.minY = Math.min(refBounds.minY, u.y); 
        refBounds.maxX = Math.max(refBounds.maxX, u.x + u.width); 
        refBounds.maxY = Math.max(refBounds.maxY, u.y + u.height); 
      }); 
    }

    let updates: Record<string, Partial<UmlClassType>> = {};
    
    if (['left', 'center', 'right', 'top', 'middle', 'bottom'].includes(type)) { 
      units.forEach(u => { 
        if (state.alignKeyId) {
          const keyClass = state.classes.find(c => c.id === state.alignKeyId);
          const keyUnitKey = (state.settings.groupAlignmentMode === 'together' && keyClass?.groupId) ? keyClass.groupId : keyClass?.id;
          if (u.id === keyUnitKey) return;
        }
        let nx = u.x, ny = u.y; 
        switch (type) { 
          case 'left': nx = refBounds.minX; break; 
          case 'center': nx = refBounds.minX + (refBounds.maxX - refBounds.minX) / 2 - u.width / 2; break; 
          case 'right': nx = refBounds.maxX - u.width; break; 
          case 'top': ny = refBounds.minY; break; 
          case 'middle': ny = refBounds.minY + (refBounds.maxY - refBounds.minY) / 2 - u.height / 2; break; 
          case 'bottom': ny = refBounds.maxY - u.height; break; 
        } 
        const dx = nx - u.x;
        const dy = ny - u.y;
        u.classes.forEach(c => { updates[c.id] = { x: c.x + dx, y: c.y + dy }; });
      }); 
    } 
    else if (type === 'distribute-h') { 
      const sorted = [...units].sort((a, b) => a.x - b.x); 
      const totalWidth = sorted.reduce((sum, u) => sum + u.width, 0); 
      const startX = sorted[0].x; 
      const endX = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width; 
      const availableSpace = (endX - startX) - totalWidth; 
      const gap = availableSpace / (sorted.length - 1); 
      let currentX = startX; 
      sorted.forEach((u, i) => { 
        const targetX = i === sorted.length - 1 ? endX - u.width : currentX;
        const dx = targetX - u.x;
        u.classes.forEach(c => { updates[c.id] = { x: c.x + dx }; });
        currentX += u.width + gap; 
      }); 
    } 
    else if (type === 'distribute-v') { 
      const sorted = [...units].sort((a, b) => a.y - b.y); 
      const totalHeight = sorted.reduce((sum, u) => sum + u.height, 0); 
      const startY = sorted[0].y; 
      const endY = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height; 
      const availableSpace = (endY - startY) - totalHeight; 
      const gap = availableSpace / (sorted.length - 1); 
      let currentY = startY; 
      sorted.forEach((u, i) => { 
        const targetY = i === sorted.length - 1 ? endY - u.height : currentY;
        const dy = targetY - u.y;
        u.classes.forEach(c => { updates[c.id] = { y: c.y + dy }; });
        currentY += u.height + gap; 
      }); 
    }
    return { classes: state.classes.map(c => updates[c.id] ? { ...c, ...updates[c.id] } : c) };
  }),
});