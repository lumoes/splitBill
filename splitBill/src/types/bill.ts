export type CurrencyCode = "CNY" | "HKD" | "USD" | "EUR";

export interface Person {
  id: string;
  name: string;
  selected: boolean;
}

export interface Dish {
  id: string;
  name: string;
  amountCents: number;
  assignedPersonIds: string[];
  selected: boolean;
}

export interface FeeInput {
  mode: "percent" | "fixed";
  value: number;
}

export interface BillInput {
  subtotalCents: number;
  serviceFee: FeeInput;
  tax: FeeInput;
  baseCurrency: CurrencyCode;
  quoteCurrency: CurrencyCode;
  fxRate: number;
  collapsed: boolean;
}

export interface BillState {
  people: Person[];
  dishes: Dish[];
  billInput: BillInput;
}

export interface DishShare {
  dishId: string;
  shareCents: number;
}

export interface PersonSummary {
  personId: string;
  totalCents: number;
  surchargeCents: number;
  dishes: DishShare[];
}

export interface Totals {
  payableCents: number;
  allocatedCents: number;
  unallocatedCents: number;
  serviceFeeCents: number;
  taxCents: number;
}
