import type { BillState, Person } from "../types/bill";

function createPerson(index: number): Person {
  return {
    id: `person-${index + 1}`,
    name: `朋友${index + 1}`,
    selected: false
  };
}

export const initialState: BillState = {
  people: [createPerson(0), createPerson(1), createPerson(2)],
  dishes: [],
  billInput: {
    subtotalCents: 0,
    serviceFee: {
      mode: "fixed",
      value: 0
    },
    tax: {
      mode: "fixed",
      value: 0
    },
    baseCurrency: "CNY",
    quoteCurrency: "CNY",
    fxRate: 1,
    collapsed: false
  }
};
