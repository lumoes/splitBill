import type { BillInput, CurrencyCode, Totals } from "../types/bill";
import { formatCents, parseDecimalInput } from "../utils/format";
import { toCents } from "../utils/money";

interface BillInfoSectionProps {
  billInput: BillInput;
  totals: Totals;
  onUpdate: (next: Partial<BillInput>) => void;
  onToggleCollapsed: (collapsed?: boolean) => void;
}

const CURRENCIES: CurrencyCode[] = ["CNY", "HKD", "USD", "EUR"];

export function BillInfoSection({
  billInput,
  totals,
  onUpdate,
  onToggleCollapsed
}: BillInfoSectionProps) {
  if (billInput.collapsed) {
    return (
      <section className="card section">
        <div className="section-title-row">
          <h2>先把账单信息告诉我</h2>
          <button className="btn" type="button" onClick={() => onToggleCollapsed(false)}>
            展开编辑
          </button>
        </div>
        <p className="inline-summary">
          总共需要分 {formatCents(totals.payableCents, billInput.baseCurrency)}
        </p>
      </section>
    );
  }

  return (
    <section className="card section">
      <div className="section-title-row">
        <h2>先把账单信息告诉我</h2>
      </div>

      <div className="form-grid">
        <label>
          小票总额（不含税费）
          <input
            type="number"
            min={0}
            step="0.01"
            value={(billInput.subtotalCents / 100).toString()}
            onChange={(event) =>
              onUpdate({ subtotalCents: toCents(parseDecimalInput(event.target.value)) })
            }
          />
        </label>

        <label>
          服务费
          <div className="inline-control">
            <select
              value={billInput.serviceFee.mode}
              onChange={(event) =>
                onUpdate({
                  serviceFee: {
                    ...billInput.serviceFee,
                    mode: event.target.value as "percent" | "fixed"
                  }
                })
              }
            >
              <option value="fixed">固定金额</option>
              <option value="percent">百分比</option>
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={billInput.serviceFee.value}
              onChange={(event) =>
                onUpdate({
                  serviceFee: {
                    ...billInput.serviceFee,
                    value: parseDecimalInput(event.target.value)
                  }
                })
              }
            />
          </div>
        </label>

        <label>
          税费
          <div className="inline-control">
            <select
              value={billInput.tax.mode}
              onChange={(event) =>
                onUpdate({
                  tax: {
                    ...billInput.tax,
                    mode: event.target.value as "percent" | "fixed"
                  }
                })
              }
            >
              <option value="fixed">固定金额</option>
              <option value="percent">百分比</option>
            </select>
            <input
              type="number"
              min={0}
              step="0.01"
              value={billInput.tax.value}
              onChange={(event) =>
                onUpdate({
                  tax: {
                    ...billInput.tax,
                    value: parseDecimalInput(event.target.value)
                  }
                })
              }
            />
          </div>
        </label>

        <label>
          原币种
          <select
            value={billInput.baseCurrency}
            onChange={(event) => onUpdate({ baseCurrency: event.target.value as CurrencyCode })}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label>
          目标币种
          <select
            value={billInput.quoteCurrency}
            onChange={(event) => onUpdate({ quoteCurrency: event.target.value as CurrencyCode })}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>

        <label>
          汇率（1 原币 = x 目标币）
          <input
            type="number"
            min={0}
            step="0.0001"
            value={billInput.fxRate}
            onChange={(event) =>
              onUpdate({ fxRate: Math.max(0, parseDecimalInput(event.target.value)) || 0 })
            }
          />
        </label>
      </div>

      <p className="inline-summary">
        现在这顿饭总共需要分 {formatCents(totals.payableCents, billInput.baseCurrency)}
      </p>

      <button className="btn" type="button" onClick={() => onToggleCollapsed(true)}>
        确定并收起
      </button>
    </section>
  );
}
