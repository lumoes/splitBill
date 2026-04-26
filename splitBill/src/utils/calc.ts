import type { BillState, Dish, PersonSummary, Totals } from "../types/bill";
import { clampNonNegative, splitCents } from "./money";

function getFeeCents(
  subtotalCents: number,
  fee: { mode: "percent" | "fixed"; value: number }
): number {
  if (fee.mode === "percent") {
    return Math.round(subtotalCents * (clampNonNegative(fee.value) / 100));
  }
  return Math.round(clampNonNegative(fee.value) * 100);
}

function getDishAssignees(dish: Dish, peopleIds: string[]): string[] {
  const unique = new Set<string>();
  for (const personId of dish.assignedPersonIds) {
    if (peopleIds.includes(personId)) {
      unique.add(personId);
    }
  }
  return [...unique];
}

export function getTotals(state: BillState): Totals {
  const subtotalCents = clampNonNegative(state.billInput.subtotalCents);
  const serviceFeeCents = getFeeCents(subtotalCents, state.billInput.serviceFee);
  const taxCents = getFeeCents(subtotalCents, state.billInput.tax);
  const payableCents = subtotalCents + serviceFeeCents + taxCents;

  const peopleIds = state.people.map((person) => person.id);
  const allocatedDishCents = state.dishes.reduce((sum, dish) => {
    const assignees = getDishAssignees(dish, peopleIds);
    if (assignees.length === 0) {
      return sum;
    }
    return sum + clampNonNegative(dish.amountCents);
  }, 0);

  const allocatedExtraCents = peopleIds.length > 0 ? serviceFeeCents + taxCents : 0;
  const allocatedCents = allocatedDishCents + allocatedExtraCents;

  return {
    payableCents,
    allocatedCents,
    unallocatedCents: payableCents - allocatedCents,
    serviceFeeCents,
    taxCents
  };
}

export function getPersonSummaries(state: BillState): PersonSummary[] {
  const peopleIds = state.people.map((person) => person.id);
  const summaries = new Map<string, PersonSummary>();

  for (const person of state.people) {
    summaries.set(person.id, {
      personId: person.id,
      totalCents: 0,
      surchargeCents: 0,
      dishes: []
    });
  }

  for (const dish of state.dishes) {
    const assignees = getDishAssignees(dish, peopleIds);
    if (assignees.length === 0) {
      continue;
    }

    const shares = splitCents(clampNonNegative(dish.amountCents), assignees.length);
    assignees.forEach((personId, index) => {
      const summary = summaries.get(personId);
      if (!summary) {
        return;
      }
      const shareCents = shares[index];
      summary.totalCents += shareCents;
      summary.dishes.push({ dishId: dish.id, shareCents });
    });
  }

  const totals = getTotals(state);
  if (state.people.length > 0) {
    const surchargeShares = splitCents(
      totals.serviceFeeCents + totals.taxCents,
      state.people.length
    );

    state.people.forEach((person, index) => {
      const summary = summaries.get(person.id);
      if (!summary) {
        return;
      }
      summary.surchargeCents += surchargeShares[index];
      summary.totalCents += surchargeShares[index];
    });
  }

  return [...summaries.values()];
}

export function buildSettlementText(state: BillState): string {
  const summaries = getPersonSummaries(state);
  const base = state.billInput.baseCurrency;
  const quote = state.billInput.quoteCurrency;
  const rate = state.billInput.fxRate;

  const nameById = new Map(state.people.map((person) => [person.id, person.name]));

  const lines: string[] = [];
  lines.push("本次分账结果");
  lines.push(`汇率: 1 ${base} = ${rate.toFixed(4)} ${quote}`);
  lines.push("-");

  for (const summary of summaries) {
    const name = nameById.get(summary.personId) ?? "未命名";
    const quoteAmount = Math.round(summary.totalCents * rate) / 100;
    const baseAmount = (summary.totalCents / 100).toFixed(2);
    lines.push(`${name}: ${base} ${baseAmount} | ${quote} ${quoteAmount.toFixed(2)}`);
  }

  return lines.join("\n");
}
