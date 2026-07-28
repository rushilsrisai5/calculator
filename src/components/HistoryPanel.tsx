import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X, CornerDownLeft, Clock } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="absolute inset-0 bg-stone-900/95 backdrop-blur-xl z-30 p-5 flex flex-col justify-between rounded-3xl border border-stone-800 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800">
            <div className="flex items-center gap-2 text-stone-200 font-semibold">
              <Clock size={18} className="text-amber-400" />
              <span>Calculation History</span>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  id="btn-clear-history-list"
                  onClick={onClearHistory}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-all text-xs flex items-center gap-1.5"
                  title="Clear all history"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}

              <button
                id="btn-close-history"
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
                title="Close History"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin scrollbar-thumb-stone-700">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-500 gap-2 py-12">
                <Clock size={32} className="text-stone-700 stroke-[1.5]" />
                <p className="text-sm font-medium">No calculations yet</p>
                <p className="text-xs text-stone-600">Your past calculations will appear here</p>
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onSelectHistoryItem(item)}
                  className="group bg-stone-800/60 hover:bg-stone-800 p-3.5 rounded-2xl border border-stone-800 hover:border-stone-700 transition-all cursor-pointer flex flex-col items-end gap-1 relative overflow-hidden"
                >
                  <div className="text-xs font-mono text-stone-400 tracking-wide">
                    {item.expression} =
                  </div>
                  <div className="text-xl font-mono font-bold text-amber-400 tracking-tight">
                    {item.result}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-semibold uppercase text-stone-400 bg-stone-900/80 px-2 py-1 rounded-lg border border-stone-700">
                    <CornerDownLeft size={10} className="text-amber-400" />
                    Load
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-stone-800 text-center">
            <p className="text-[11px] text-stone-500">
              Click any item to load result into calculator
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
