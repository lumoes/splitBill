import { useState } from "react";
import { parseDecimalInput } from "../utils/format";
import { toCents } from "../utils/money";

interface DishFormProps {
  onAdd: (payload: { name: string; amountCents: number }) => void;
}

export function DishForm({ onAdd }: DishFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [expression, setExpression] = useState("");

  const evaluateExpression = (raw: string): number | null => {
    const normalized = raw.replace(/[xX]/g, "*").replace(/÷/g, "/").replace(/\s+/g, "");
    if (!normalized) {
      return null;
    }
    if (!/^[\d+\-*/().]+$/.test(normalized)) {
      return null;
    }

    try {
      const result = Function(`"use strict"; return (${normalized});`)();
      if (typeof result !== "number" || !Number.isFinite(result)) {
        return null;
      }
      return result;
    } catch {
      return null;
    }
  };

  const formatCalcResult = (value: number): string => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toString();
  };

  const resolveAmountValue = (raw: string): number => {
    const calculated = evaluateExpression(raw);
    if (calculated !== null) {
      return calculated;
    }
    return parseDecimalInput(raw);
  };

  const applyCalculatorResult = () => {
    const calculated = evaluateExpression(expression);
    if (calculated === null || calculated < 0) {
      return;
    }
    const next = formatCalcResult(calculated);
    setAmount(next);
    setExpression(next);
  };

  return (
    <div className="dish-form">
      <label>
        菜名
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="例：烤鸭"
        />
      </label>
      <label>
        金额
        <div className="amount-input-row">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00 或 12+8.5"
          />
          <button
            className="btn btn-small btn-ghost calc-toggle"
            type="button"
            onClick={() => {
              const nextOpen = !showCalculator;
              setShowCalculator(nextOpen);
              if (nextOpen) {
                setExpression(amount);
              }
            }}
          >
            计算器
          </button>
        </div>
      </label>
      <button
        className="btn"
        type="button"
        onClick={() => {
          const trimmed = name.trim();
          const amountCents = toCents(resolveAmountValue(amount));
          if (!trimmed || amountCents <= 0) {
            return;
          }
          onAdd({ name: trimmed, amountCents });
          setName("");
          setAmount("");
          setExpression("");
          setShowCalculator(false);
        }}
      >
        添加新菜
      </button>

      {showCalculator && (
        <div className="calc-panel">
          <div className="calc-display-row">
            <input
              className="calc-display"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              placeholder="输入算式"
            />
            <button className="btn btn-small btn-ghost" type="button" onClick={applyCalculatorResult}>
              =
            </button>
          </div>

          <div className="calc-keys">
            {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "(", ")", "+", "C", "⌫"].map((key) => (
              <button
                key={key}
                className="calc-key"
                type="button"
                onClick={() => {
                  if (key === "C") {
                    setExpression("");
                    return;
                  }
                  if (key === "⌫") {
                    setExpression((prev) => prev.slice(0, -1));
                    return;
                  }
                  setExpression((prev) => `${prev}${key}`);
                }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
