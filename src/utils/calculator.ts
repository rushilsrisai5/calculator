/**
 * Format raw string or number into a user-friendly display string
 * with proper digit commas for the integer part.
 */
export function formatDisplayValue(val: string): string {
  if (!val) return '0';
  if (val === 'Error' || val === 'Infinity' || val === '-Infinity' || val === 'NaN') {
    return 'Error';
  }

  // Handle scientific notation e.g. "1e+20"
  if (val.includes('e')) {
    return val;
  }

  const parts = val.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let formattedInt = integerPart;
  if (integerPart !== '-' && integerPart !== '' && !isNaN(Number(integerPart))) {
    const isNegative = integerPart.startsWith('-');
    const digits = isNegative ? integerPart.slice(1) : integerPart;
    formattedInt = (isNegative ? '-' : '') + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  if (decimalPart !== undefined) {
    return `${formattedInt}.${decimalPart}`;
  }

  return formattedInt;
}

/**
 * Clean up floating point precision issues (e.g. 0.1 + 0.2 = 0.30000000000000004)
 */
export function sanitizeNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) {
    return 'Error';
  }

  // Round to max 10 decimal places to eliminate floating point inaccuracies
  const precision = 1e10;
  const rounded = Math.round(num * precision) / precision;

  if (Math.abs(rounded) > 1e12 || (Math.abs(rounded) < 1e-7 && rounded !== 0)) {
    return rounded.toExponential(6);
  }

  return String(rounded);
}

/**
 * Safe evaluator for scientific expressions
 */
export function evaluateExpression(expr: string): string {
  try {
    // Replace visual tokens with Math equivalents
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![a-z])/g, 'Math.E')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/(\d+)%/g, '($1/100)')
      .replace(/\^/g, '**');

    // Handle factorial e.g. 5!
    sanitized = sanitized.replace(/(\d+)!/g, (_, n) => {
      const num = parseInt(n, 10);
      if (num < 0 || num > 170) return 'NaN';
      let fact = 1;
      for (let i = 2; i <= num; i++) fact *= i;
      return String(fact);
    });

    // Check for unsafe characters
    if (/[^0-9+\-*/()., %MathEPIsqrtlogsincotan\s**]/.test(sanitized)) {
      return 'Error';
    }

    // Function constructor safer evaluation
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (typeof result !== 'number') return 'Error';
    return sanitizeNumber(result);
  } catch {
    return 'Error';
  }
}
