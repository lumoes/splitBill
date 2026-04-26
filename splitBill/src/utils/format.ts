import type { CurrencyCode } from "../types/bill";
import { fromCents } from "./money";

export function formatCents(cents: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(fromCents(cents));
}

export function parseDecimalInput(raw: string): number {
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return parsed;
}

export function shortCurrencyLabel(currency: CurrencyCode): string {
  const map: Record<CurrencyCode, string> = {
    CNY: "人民币",
    HKD: "港币",
    USD: "美元",
    EUR: "欧元"
  };
  return map[currency];
}
