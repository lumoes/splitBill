export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function clampNonNegative(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, value);
}

export function splitCents(total: number, parts: number): number[] {
  if (parts <= 0) {
    return [];
  }
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  const shares = new Array<number>(parts).fill(base);
  for (let i = 0; i < remainder; i += 1) {
    shares[i] += 1;
  }
  return shares;
}

export function toQuoteCents(baseCents: number, fxRate: number): number {
  return Math.round(baseCents * fxRate);
}
