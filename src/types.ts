export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

export type CalculatorMode = 'standard' | 'scientific';

export type KeyType = 'number' | 'operator' | 'function' | 'action' | 'memory' | 'equals';

export interface KeyConfig {
  label: string;
  value: string;
  type: KeyType;
  span?: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'subtle';
  ariaLabel?: string;
  shortcut?: string;
}
