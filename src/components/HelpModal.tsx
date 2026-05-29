import React from 'react';
import { Modal } from './Modal';
import { Star, Zap, Share2, Type, Combine, Layout } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Shortcuts" maxWidth="max-w-2xl">
      <div className="p-5 flex flex-col gap-6 text-sm text-slate-700 dark:text-slate-300">
        {/* Features Section */}
        <section>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
            <Star size={16} className="text-amber-500" /> Key Features & Guides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><Share2 size={16}/> Smart Arrows</div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Connect elements dynamically. <strong>Right-click</strong> an arrow to add anchor points or reverse direction. Drag labels to reposition them independently.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400"><Type size={16}/> Rich Text & Math</div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Notes support Markdown (tables, lists, <code>&gt; blockquotes</code>). Use <code>$$math$$</code> for KaTeX block math and <code>$math$</code> for inline.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><Combine size={16}/> Grouping</div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Select multiple items and press <strong>Ctrl+G</strong>. Groups can be moved and rotated together. Double-click an item inside a group to select it individually.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><Layout size={16}/> Alignment</div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">Select multiple items to see alignment tools in the right panel. Click an already selected item to make it the <strong>Key Object</strong> (red border) to align others to it.</p>
            </div>
          </div>
        </section>
        
        {/* Shortcuts Section */}
        <section>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
            <Zap size={16} className="text-blue-500" /> Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Selection Tool', key: 'V' },
              { label: 'Hand / Pan Tool', key: 'H' },
              { label: 'Zoom Tool', key: 'Z' },
              { label: 'Temporary Pan', key: 'Hold Space' },
              { label: 'Pan Up / Down', key: 'Scroll' },
              { label: 'Pan Left / Right', key: 'Shift + Scroll' },
              { label: 'Zoom In / Out', key: 'Ctrl + Scroll' },
              { label: 'Copy / Paste', key: 'Ctrl + C / V' },
              { label: 'Duplicate', key: 'Ctrl + D' },
              { label: 'Group / Ungroup', key: 'Ctrl + G' },
              { label: 'Undo / Redo', key: 'Ctrl + Z / Y' },
              { label: 'Multi-Select', key: 'Ctrl + Click' },
              { label: 'Delete Item', key: 'Del / Backspace' },
              { label: 'Maintain Ratio / Snap Angle', key: 'Hold Shift' },
            ].map((shortcut, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700/50">
                <span className="font-medium">{shortcut.label}</span> 
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded font-mono shadow-sm whitespace-nowrap">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
};