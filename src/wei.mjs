/**
 * Exact wei/gwei/ether conversion.
 *
 * Amounts must never round-trip through a floating point number: 0.1 ether is
 * 100000000000000000 wei exactly, and `0.1 * 1e18` is not. Everything here uses
 * BigInt, and parsing is done on the decimal string without ever converting to
 * Number.
 */

export const UNITS = /** @type {const} */ ({
  wei: 0n,
  kwei: 3n,
  mwei: 6n,
  gwei: 9n,
  szabo: 12n,
  finney: 15n,
  ether: 18n,
});

const DECIMAL = /^-?\d+(\.\d+)?$/;

/**
 * Parse a decimal string like "1.5" into base units.
 * @param {string} value
 * @param {keyof UNITS} unit
 * @returns {bigint}
 */
export function parseUnits(value, unit) {
  const exponent = UNITS[unit];
  if (exponent === undefined) throw new Error(`unknown unit: ${unit}`);
  const s = String(value).trim();
  if (!DECIMAL.test(s)) throw new Error(`not a decimal number: "${value}"`);

  const negative = s.startsWith("-");
  const [whole, frac = ""] = (negative ? s.slice(1) : s).split(".");
  if (frac.length > Number(exponent)) {
    throw new Error(`"${value}" has more than ${exponent} decimal places for ${unit}`);
  }
  const padded = frac.padEnd(Number(exponent), "0");
  const n = BigInt(whole + padded);
  return negative ? -n : n;
}

/**
 * Render base units as a decimal string, trimming trailing zeros but keeping
 * at least one digit after the point.
 * @param {bigint} value
 * @param {keyof UNITS} unit
 */
export function formatUnits(value, unit) {
  const exponent = UNITS[unit];
  if (exponent === undefined) throw new Error(`unknown unit: ${unit}`);
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(Number(exponent) + 1, "0");
  const cut = digits.length - Number(exponent);
  const whole = digits.slice(0, cut);
  const frac = digits.slice(cut).replace(/0+$/, "");
  const body = frac.length ? `${whole}.${frac}` : whole;
  return negative ? `-${body}` : body;
}

/** Convert between units without a string round-trip. */
export function convert(value, from, to) {
  const a = UNITS[from];
  const b = UNITS[to];
  if (a === undefined || b === undefined) throw new Error(`unknown unit in ${from}->${to}`);
  if (a === b) return value;
  // finer unit (larger exponent) -> coarser unit is a multiplication:
  // 1 ether is 10^9 gwei, not 10^-9
  return a > b ? value * 10n ** (a - b) : value / 10n ** (b - a);
}

/** Human string with the unit, the way a wallet shows a balance. */
export function human(value, unit = "ether") {
  const s = formatUnits(value, unit);
  return `${s} ${unit}`;
}
