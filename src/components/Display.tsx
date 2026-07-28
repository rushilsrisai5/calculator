import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Volume2, VolumeX, History, Calculator as CalcIcon, Binary } from 'lucide-react';
import { formatDisplayValue } from '../utils/calculator';
import { CalculatorMode } from '../types';

interface DisplayProps {
  expression: string;
  value: string;
  memoryValue: number | null;
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onToggleHistory: () => void;
  isHistoryOpen: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  value,
  memoryValue,
  mode,
  onModeChange,
  isSoundEnabled,
  onToggleSound,
  onToggleHistory,
  isHistoryOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const formattedVal = formatDisplayValue(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Dynamically scale text size based on character length
  const getTextSizeClass = (len: number) => {
    if (len > 18) return 'text-2xl sm:text-3xl';
    if (len > 14) return 'text-3xl sm:text-4xl';
    if (len > 10) return 'text-4xl sm:text-5xl';
    return 'text-5xl sm:text-6xl';
  };

  return (
    <div className="bg-stone-900 text-stone-100 p-5 rounded-3xl shadow-xl flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative overflow-hidden border border-stone-800 transition-all">
      {/* Top Bar / Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-stone-800/80 backdrop-blur-md p-1 rounded-full border border-stone-700/50">
          <button
            id="btn-mode-standard"
            onClick={() => onModeChange('standard')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              mode === 'standard'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Standard Calculator"
          >
            Standard
          </button>
          <button
            id="btn-mode-scientific"
            onClick={() => onModeChange('scientific')}
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${
              mode === 'scientific'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Scientific Calculator"
          >
            Scientific
          </button>
        </div>

        <div className="flex items-center gap-2">
          {memoryValue !== null && (
            <span
              id="indicator-memory"
              className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20"
            >
              M ({memoryValue})
            </span>
          )}

          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isSoundEnabled
                ? 'bg-stone-800 text-amber-400 border-stone-700 hover:bg-stone-700'
                : 'bg-stone-800/50 text-stone-500 border-stone-800 hover:text-stone-300'
            }`}
            title={isSoundEnabled ? 'Mute Key Sounds' : 'Enable Key Sounds'}
            aria-label="Toggle Sound"
          >
            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            id="btn-toggle-history"
            onClick={onToggleHistory}
            className={`p-2 rounded-xl border transition-all ${
              isHistoryOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title="Toggle Calculation History"
            aria-label="Toggle History"
          >
            <History size={16} />
          </button>

          <button
            id="btn-copy-result"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 hover:text-stone-100 transition-all active:scale-95"
            title="Copy Result"
            aria-label="Copy to Clipboard"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Main Display Screen */}
      <div className="flex flex-col items-end justify-end mt-4 z-10 w-full overflow-hidden">
        {/* Previous expression or calculation history */}
        <div className="h-6 text-stone-400 text-sm font-mono tracking-wider overflow-x-auto whitespace-nowrap max-w-full text-right transition-all scrollbar-none">
          {expression || '\u00A0'}
        </div>

        {/* Current main value */}
        <div className="w-full text-right overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={formattedVal}
              initial={{ opacity: 0.8, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.08 }}
              className={`font-semibold font-mono tracking-tight text-stone-50 select-all ${getTextSizeClass(
                formattedVal.length
              )}`}
            >
              {formattedVal}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Copy notification toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 text-xs font-semibold px-3 py-1 rounded-full shadow-lg pointer-events-none"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
