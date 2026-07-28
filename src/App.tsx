import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Calculator as CalcIcon, HelpCircle, Keyboard } from 'lucide-react';
import { Display } from './components/Display';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { HistoryPanel } from './components/HistoryPanel';
import { CalculatorMode, HistoryItem } from './types';
import { evaluateExpression } from './utils/calculator';
import { playKeySound } from './utils/audio';

export default function App() {
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [activeOperator, setActiveOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [memoryValue, setMemoryValue] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // Ignore quota errors
    }
  }, [history]);

  // Audio helper wrapper
  const triggerSound = useCallback(
    (type: 'number' | 'operator' | 'equals' | 'action' = 'number') => {
      if (isSoundEnabled) {
        playKeySound(type);
      }
    },
    [isSoundEnabled]
  );

  // Handle number and decimal input
  const handleDigit = useCallback(
    (digit: string) => {
      triggerSound('number');

      if (displayValue === 'Error' || waitingForOperand) {
        setDisplayValue(digit === '.' ? '0.' : digit);
        setWaitingForOperand(false);
        return;
      }

      if (digit === '.') {
        if (!displayValue.includes('.')) {
          setDisplayValue(displayValue + '.');
        }
        return;
      }

      if (displayValue === '0') {
        setDisplayValue(digit);
      } else if (displayValue.length < 18) {
        setDisplayValue(displayValue + digit);
      }
    },
    [displayValue, waitingForOperand, triggerSound]
  );

  // Handle standard binary operators (+, -, ×, ÷, %, ^)
  const handleOperator = useCallback(
    (op: string) => {
      triggerSound('operator');

      if (displayValue === 'Error') return;

      if (activeOperator && waitingForOperand) {
        // Change current active operator
        setActiveOperator(op);
        setExpression((prev) => prev.slice(0, -1) + op);
        return;
      }

      if (previousOperand !== null && activeOperator) {
        // Evaluate continuous chain calculation
        const fullExpr = `${expression} ${displayValue}`;
        const result = evaluateExpression(fullExpr);

        if (result === 'Error') {
          setDisplayValue('Error');
          setExpression('');
          setPreviousOperand(null);
          setActiveOperator(null);
          return;
        }

        setDisplayValue(result);
        setPreviousOperand(result);
        setExpression(`${result} ${op}`);
      } else {
        setPreviousOperand(displayValue);
        setExpression(`${displayValue} ${op}`);
      }

      setActiveOperator(op);
      setWaitingForOperand(true);
    },
    [displayValue, expression, previousOperand, activeOperator, waitingForOperand, triggerSound]
  );

  // Perform evaluation (=)
  const handleEquals = useCallback(() => {
    triggerSound('equals');

    if (displayValue === 'Error') return;

    let fullExpr = '';
    if (activeOperator && previousOperand !== null) {
      fullExpr = `${expression} ${displayValue}`;
    } else if (expression && !expression.endsWith('=')) {
      fullExpr = `${expression} ${displayValue}`;
    } else {
      fullExpr = displayValue;
    }

    const result = evaluateExpression(fullExpr);

    if (result !== 'Error') {
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        expression: fullExpr,
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [newHistoryItem, ...prev]);
    }

    setDisplayValue(result);
    setExpression(`${fullExpr} =`);
    setPreviousOperand(null);
    setActiveOperator(null);
    setWaitingForOperand(true);
  }, [displayValue, expression, activeOperator, previousOperand, triggerSound]);

  // Handle Clear & Backspace & PlusMinus
  const handleAction = useCallback(
    (actionValue: string) => {
      triggerSound('action');

      switch (actionValue) {
        case 'CLEAR':
          if (displayValue !== '0' && displayValue !== 'Error') {
            setDisplayValue('0');
          } else {
            setDisplayValue('0');
            setExpression('');
            setPreviousOperand(null);
            setActiveOperator(null);
            setWaitingForOperand(false);
          }
          break;

        case 'BACKSPACE':
          if (displayValue === 'Error' || waitingForOperand) return;
          if (displayValue.length <= 1 || (displayValue.length === 2 && displayValue.startsWith('-'))) {
            setDisplayValue('0');
          } else {
            setDisplayValue(displayValue.slice(0, -1));
          }
          break;

        case '±':
          if (displayValue === '0' || displayValue === 'Error') return;
          if (displayValue.startsWith('-')) {
            setDisplayValue(displayValue.slice(1));
          } else {
            setDisplayValue('-' + displayValue);
          }
          break;

        default:
          break;
      }
    },
    [displayValue, waitingForOperand, triggerSound]
  );

  // Memory functions (MC, MR, M+, M-)
  const handleMemory = useCallback(
    (memAction: string) => {
      triggerSound('action');
      const numVal = parseFloat(displayValue);

      switch (memAction) {
        case 'MC':
          setMemoryValue(null);
          break;
        case 'MR':
          if (memoryValue !== null) {
            setDisplayValue(String(memoryValue));
            setWaitingForOperand(true);
          }
          break;
        case 'M+':
          if (!isNaN(numVal)) {
            setMemoryValue((prev) => (prev ?? 0) + numVal);
            setWaitingForOperand(true);
          }
          break;
        case 'M-':
          if (!isNaN(numVal)) {
            setMemoryValue((prev) => (prev ?? 0) - numVal);
            setWaitingForOperand(true);
          }
          break;
      }
    },
    [displayValue, memoryValue, triggerSound]
  );

  // Scientific scientific functions handler
  const handleScientific = useCallback(
    (func: string) => {
      triggerSound('operator');

      if (displayValue === 'Error') return;

      const numVal = parseFloat(displayValue);

      if (['sin(', 'cos(', 'tan(', '√(', 'ln(', 'log(', 'abs('].includes(func)) {
        setExpression(`${func}${displayValue})`);
        const res = evaluateExpression(`${func}${displayValue})`);
        setDisplayValue(res);
        setWaitingForOperand(true);
      } else if (func === '^2') {
        const exprStr = `${displayValue}^2`;
        setExpression(exprStr);
        setDisplayValue(evaluateExpression(exprStr));
        setWaitingForOperand(true);
      } else if (func === '^3') {
        const exprStr = `${displayValue}^3`;
        setExpression(exprStr);
        setDisplayValue(evaluateExpression(exprStr));
        setWaitingForOperand(true);
      } else if (func === '1/') {
        const exprStr = `1/(${displayValue})`;
        setExpression(exprStr);
        setDisplayValue(evaluateExpression(exprStr));
        setWaitingForOperand(true);
      } else if (func === '!') {
        const exprStr = `${displayValue}!`;
        setExpression(exprStr);
        setDisplayValue(evaluateExpression(exprStr));
        setWaitingForOperand(true);
      } else if (func === 'π') {
        setDisplayValue(String(Math.PI));
        setWaitingForOperand(true);
      } else if (func === 'e') {
        setDisplayValue(String(Math.E));
        setWaitingForOperand(true);
      } else {
        // Appending parenthesis or general symbols
        if (waitingForOperand || displayValue === '0') {
          setDisplayValue(func);
        } else {
          setDisplayValue(displayValue + func);
        }
        setWaitingForOperand(false);
      }
    },
    [displayValue, waitingForOperand, triggerSound]
  );

  // Master keypress dispatcher
  const handleKeyPress = useCallback(
    (keyVal: string, keyType: string) => {
      switch (keyType) {
        case 'number':
          handleDigit(keyVal);
          break;
        case 'operator':
          handleOperator(keyVal);
          break;
        case 'equals':
          handleEquals();
          break;
        case 'action':
          handleAction(keyVal);
          break;
        case 'memory':
          handleMemory(keyVal);
          break;
        case 'function':
          handleScientific(keyVal);
          break;
      }
    },
    [handleDigit, handleOperator, handleEquals, handleAction, handleMemory, handleScientific]
  );

  // Global Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if focused on inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDigit('.');
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '%') {
        handleOperator('%');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleAction('BACKSPACE');
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        handleAction('CLEAR');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleEquals, handleAction]);

  const clearLabel = displayValue !== '0' && displayValue !== 'Error' ? 'C' : 'AC';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Container Widget */}
      <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-2xl p-5 sm:p-6 rounded-[36px] border border-stone-800 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Top Header Branding */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-stone-300 font-semibold tracking-wide">
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CalcIcon size={18} />
            </div>
            <span className="text-sm font-medium tracking-tight">Calculator</span>
          </div>

          <button
            id="btn-keyboard-help"
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-all text-xs flex items-center gap-1"
            title="Keyboard Shortcuts"
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={15} />
          </button>
        </div>

        {/* Keyboard Shortcuts Overlay Banner */}
        {showKeyboardHelp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 bg-stone-800/90 border border-stone-700/80 p-3 rounded-2xl text-xs text-stone-300 space-y-1.5"
          >
            <div className="font-semibold text-amber-400 flex items-center justify-between">
              <span>Keyboard Controls</span>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-stone-500 hover:text-stone-300 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono text-stone-400">
              <div><span className="text-stone-200">0-9 .</span> : Digits</div>
              <div><span className="text-stone-200">+ - * /</span> : Operators</div>
              <div><span className="text-stone-200">Enter / =</span> : Result</div>
              <div><span className="text-stone-200">Backspace</span> : Delete</div>
              <div><span className="text-stone-200">Esc / C</span> : Clear</div>
              <div><span className="text-stone-200">%</span> : Percent</div>
            </div>
          </motion.div>
        )}

        {/* Display Component */}
        <Display
          expression={expression}
          value={displayValue}
          memoryValue={memoryValue}
          mode={mode}
          onModeChange={setMode}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={() => setIsSoundEnabled(!isSoundEnabled)}
          onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          isHistoryOpen={isHistoryOpen}
        />

        {/* Keypad Component */}
        <CalculatorKeypad
          mode={mode}
          onKeyPress={handleKeyPress}
          activeOperator={activeOperator}
          clearLabel={clearLabel}
        />

        {/* History Panel Drawer */}
        <HistoryPanel
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectHistoryItem={(item) => {
            setDisplayValue(item.result);
            setExpression(`${item.expression} =`);
            setWaitingForOperand(true);
            setIsHistoryOpen(false);
          }}
          onClearHistory={() => setHistory([])}
        />
      </div>

      {/* Footer minimal signature */}
      <div className="mt-4 text-center text-xs text-stone-600 font-medium">
        Designed for precision & simplicity
      </div>
    </div>
  );
}
