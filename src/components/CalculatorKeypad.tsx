import React from 'react';
import { motion } from 'motion/react';
import { Delete, RotateCcw } from 'lucide-react';
import { CalculatorMode, KeyConfig } from '../types';

interface CalculatorKeypadProps {
  mode: CalculatorMode;
  onKeyPress: (key: string, type: string) => void;
  activeOperator: string | null;
  clearLabel: 'AC' | 'C';
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  mode,
  onKeyPress,
  activeOperator,
  clearLabel,
}) => {
  // Memory Keys
  const memoryKeys: KeyConfig[] = [
    { label: 'MC', value: 'MC', type: 'memory', variant: 'subtle', ariaLabel: 'Memory Clear' },
    { label: 'MR', value: 'MR', type: 'memory', variant: 'subtle', ariaLabel: 'Memory Recall' },
    { label: 'M+', value: 'M+', type: 'memory', variant: 'subtle', ariaLabel: 'Memory Add' },
    { label: 'M-', value: 'M-', type: 'memory', variant: 'subtle', ariaLabel: 'Memory Subtract' },
  ];

  // Standard keypad configuration
  const standardKeys: KeyConfig[] = [
    { label: clearLabel, value: 'CLEAR', type: 'action', variant: 'secondary', ariaLabel: clearLabel === 'AC' ? 'All Clear' : 'Clear Entry' },
    { label: '±', value: '±', type: 'action', variant: 'secondary', ariaLabel: 'Plus Minus Toggle' },
    { label: '%', value: '%', type: 'operator', variant: 'secondary', ariaLabel: 'Percent' },
    { label: '÷', value: '÷', type: 'operator', variant: 'accent', ariaLabel: 'Divide' },

    { label: '7', value: '7', type: 'number', variant: 'primary' },
    { label: '8', value: '8', type: 'number', variant: 'primary' },
    { label: '9', value: '9', type: 'number', variant: 'primary' },
    { label: '×', value: '×', type: 'operator', variant: 'accent', ariaLabel: 'Multiply' },

    { label: '4', value: '4', type: 'number', variant: 'primary' },
    { label: '5', value: '5', type: 'number', variant: 'primary' },
    { label: '6', value: '6', type: 'number', variant: 'primary' },
    { label: '-', value: '-', type: 'operator', variant: 'accent', ariaLabel: 'Subtract' },

    { label: '1', value: '1', type: 'number', variant: 'primary' },
    { label: '2', value: '2', type: 'number', variant: 'primary' },
    { label: '3', value: '3', type: 'number', variant: 'primary' },
    { label: '+', value: '+', type: 'operator', variant: 'accent', ariaLabel: 'Add' },

    { label: '0', value: '0', type: 'number', variant: 'primary' },
    { label: '.', value: '.', type: 'number', variant: 'primary', ariaLabel: 'Decimal Point' },
    { label: '⌫', value: 'BACKSPACE', type: 'action', variant: 'secondary', ariaLabel: 'Backspace' },
    { label: '=', value: '=', type: 'equals', variant: 'accent', ariaLabel: 'Equals' },
  ];

  // Scientific scientific-only row functions
  const scientificKeys: KeyConfig[] = [
    { label: '(', value: '(', type: 'function', variant: 'subtle' },
    { label: ')', value: ')', type: 'function', variant: 'subtle' },
    { label: 'π', value: 'π', type: 'function', variant: 'subtle' },
    { label: 'e', value: 'e', type: 'function', variant: 'subtle' },

    { label: 'sin', value: 'sin(', type: 'function', variant: 'subtle' },
    { label: 'cos', value: 'cos(', type: 'function', variant: 'subtle' },
    { label: 'tan', value: 'tan(', type: 'function', variant: 'subtle' },
    { label: '√', value: '√(', type: 'function', variant: 'subtle' },

    { label: 'x²', value: '^2', type: 'function', variant: 'subtle' },
    { label: 'x³', value: '^3', type: 'function', variant: 'subtle' },
    { label: 'xʸ', value: '^', type: 'function', variant: 'subtle' },
    { label: 'x!', value: '!', type: 'function', variant: 'subtle' },

    { label: 'ln', value: 'ln(', type: 'function', variant: 'subtle' },
    { label: 'log', value: 'log(', type: 'function', variant: 'subtle' },
    { label: '1/x', value: '1/', type: 'function', variant: 'subtle' },
    { label: '|x|', value: 'abs(', type: 'function', variant: 'subtle' },
  ];

  const getButtonStyle = (key: KeyConfig) => {
    const isActive = activeOperator && activeOperator === key.value;

    switch (key.variant) {
      case 'accent':
        return isActive
          ? 'bg-amber-400 text-stone-950 font-bold border-amber-300 ring-2 ring-amber-400/50 shadow-md scale-[0.98]'
          : key.type === 'equals'
          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20 active:bg-amber-600'
          : 'bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold border border-stone-700/80 shadow-sm';

      case 'secondary':
        return 'bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium border border-stone-700/60 shadow-sm';

      case 'subtle':
        return 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 font-mono text-sm border border-stone-800/80 shadow-sm';

      case 'primary':
      default:
        return 'bg-stone-800/90 hover:bg-stone-700/90 text-stone-100 font-medium text-lg sm:text-xl border border-stone-700/50 shadow-sm active:bg-stone-800';
    }
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      {/* Memory Bar */}
      <div className="grid grid-cols-4 gap-2">
        {memoryKeys.map((key) => (
          <button
            key={key.value}
            id={`btn-mem-${key.label.toLowerCase()}`}
            onClick={() => onKeyPress(key.value, key.type)}
            className="py-1.5 px-2 rounded-xl text-xs font-mono font-semibold bg-stone-900/60 hover:bg-stone-800 text-stone-400 hover:text-amber-400 border border-stone-800 transition-all active:scale-95 text-center"
            aria-label={key.ariaLabel || key.label}
          >
            {key.label}
          </button>
        ))}
      </div>

      {/* Scientific Functions Grid (if mode === 'scientific') */}
      {mode === 'scientific' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-4 gap-2 pt-1 border-t border-stone-800/80"
        >
          {scientificKeys.map((key) => (
            <motion.button
              key={key.value}
              id={`btn-sci-${key.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}
              whileTap={{ scale: 0.94 }}
              onClick={() => onKeyPress(key.value, key.type)}
              className={`py-2 px-1.5 rounded-xl transition-all duration-150 flex items-center justify-center select-none ${getButtonStyle(
                key
              )}`}
              aria-label={key.ariaLabel || key.label}
            >
              {key.label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Main Standard Keypad Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5 pt-1">
        {standardKeys.map((key) => (
          <motion.button
            key={key.value}
            id={`btn-key-${key.value.toLowerCase()}`}
            whileTap={{ scale: 0.92 }}
            onClick={() => onKeyPress(key.value, key.type)}
            className={`h-13 sm:h-15 rounded-2xl transition-all duration-150 flex items-center justify-center select-none cursor-pointer ${getButtonStyle(
              key
            )}`}
            aria-label={key.ariaLabel || key.label}
          >
            {key.value === 'BACKSPACE' ? <Delete size={20} /> : key.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
