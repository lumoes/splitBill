import type { BillState, Dish, Person } from "../types/bill";
import { initialState } from "./initialState";

let dishCounter = 0;

function createPerson(index: number): Person {
  return {
    id: `person-${index + 1}`,
    name: `朋友${index + 1}`,
    selected: false
  };
}

function createDish(payload: { name: string; amountCents: number }): Dish {
  dishCounter += 1;
  return {
    id: `dish-${Date.now()}-${dishCounter}`,
    name: payload.name,
    amountCents: payload.amountCents,
    assignedPersonIds: [],
    selected: false
  };
}

function resizePeople(people: Person[], nextCount: number): Person[] {
  if (nextCount <= 0) {
    return [createPerson(0)];
  }

  if (nextCount === people.length) {
    return people;
  }

  if (nextCount < people.length) {
    return people.slice(0, nextCount);
  }

  const nextPeople = [...people];
  for (let i = people.length; i < nextCount; i += 1) {
    nextPeople.push(createPerson(i));
  }
  return nextPeople;
}

export type BillAction =
  | { type: "SET_PEOPLE_COUNT"; payload: number }
  | { type: "RENAME_PERSON"; payload: { personId: string; name: string } }
  | { type: "TOGGLE_PERSON_SELECTED"; payload: { personId: string } }
  | { type: "SELECT_ALL_PEOPLE" }
  | { type: "CLEAR_PEOPLE_SELECTION" }
  | { type: "UPDATE_BILL_FIELD"; payload: Partial<BillState["billInput"]> }
  | { type: "TOGGLE_BILL_COLLAPSED"; payload?: boolean }
  | {
      type: "ADD_DISH";
      payload: { name: string; amountCents: number };
    }
  | {
      type: "UPDATE_DISH";
      payload: {
        dishId: string;
        name?: string;
        amountCents?: number;
      };
    }
  | { type: "DELETE_DISH"; payload: { dishId: string } }
  | { type: "TOGGLE_DISH_SELECTED"; payload: { dishId: string } }
  | { type: "CLEAR_DISH_SELECTION" }
  | { type: "SELECT_ALL_DISHES" }
  | { type: "ASSIGN_DISH_TO_PERSON"; payload: { dishId: string; personId: string } }
  | { type: "ASSIGN_SELECTED_DISHES_TO_SELECTED_PEOPLE" }
  | { type: "RESTORE_STATE"; payload: BillState }
  | { type: "RESET_ALL" };

export function billReducer(state: BillState, action: BillAction): BillState {
  switch (action.type) {
    case "SET_PEOPLE_COUNT": {
      const people = resizePeople(state.people, action.payload);
      const validIds = new Set(people.map((person) => person.id));
      const dishes = state.dishes.map((dish) => ({
        ...dish,
        assignedPersonIds: dish.assignedPersonIds.filter((id) => validIds.has(id))
      }));
      return {
        ...state,
        people,
        dishes
      };
    }

    case "RENAME_PERSON": {
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === action.payload.personId
            ? { ...person, name: action.payload.name }
            : person
        )
      };
    }

    case "TOGGLE_PERSON_SELECTED": {
      return {
        ...state,
        people: state.people.map((person) =>
          person.id === action.payload.personId
            ? { ...person, selected: !person.selected }
            : person
        )
      };
    }

    case "SELECT_ALL_PEOPLE": {
      return {
        ...state,
        people: state.people.map((person) => ({ ...person, selected: true }))
      };
    }

    case "CLEAR_PEOPLE_SELECTION": {
      return {
        ...state,
        people: state.people.map((person) => ({ ...person, selected: false }))
      };
    }

    case "UPDATE_BILL_FIELD": {
      return {
        ...state,
        billInput: {
          ...state.billInput,
          ...action.payload
        }
      };
    }

    case "TOGGLE_BILL_COLLAPSED": {
      return {
        ...state,
        billInput: {
          ...state.billInput,
          collapsed:
            typeof action.payload === "boolean"
              ? action.payload
              : !state.billInput.collapsed
        }
      };
    }

    case "ADD_DISH": {
      return {
        ...state,
        dishes: [...state.dishes, createDish(action.payload)]
      };
    }

    case "UPDATE_DISH": {
      return {
        ...state,
        dishes: state.dishes.map((dish) => {
          if (dish.id !== action.payload.dishId) {
            return dish;
          }
          return {
            ...dish,
            name: action.payload.name ?? dish.name,
            amountCents: action.payload.amountCents ?? dish.amountCents
          };
        })
      };
    }

    case "DELETE_DISH": {
      return {
        ...state,
        dishes: state.dishes.filter((dish) => dish.id !== action.payload.dishId)
      };
    }

    case "TOGGLE_DISH_SELECTED": {
      return {
        ...state,
        dishes: state.dishes.map((dish) =>
          dish.id === action.payload.dishId ? { ...dish, selected: !dish.selected } : dish
        )
      };
    }

    case "CLEAR_DISH_SELECTION": {
      return {
        ...state,
        dishes: state.dishes.map((dish) => ({ ...dish, selected: false }))
      };
    }

    case "SELECT_ALL_DISHES": {
      return {
        ...state,
        dishes: state.dishes.map((dish) => ({ ...dish, selected: true }))
      };
    }

    case "ASSIGN_DISH_TO_PERSON": {
      return {
        ...state,
        dishes: state.dishes.map((dish) => {
          if (dish.id !== action.payload.dishId) {
            return dish;
          }
          return {
            ...dish,
            assignedPersonIds: [action.payload.personId],
            selected: false
          };
        })
      };
    }

    case "ASSIGN_SELECTED_DISHES_TO_SELECTED_PEOPLE": {
      const selectedPeopleIds = state.people
        .filter((person) => person.selected)
        .map((person) => person.id);

      if (selectedPeopleIds.length === 0) {
        return state;
      }

      return {
        ...state,
        dishes: state.dishes.map((dish) => {
          if (!dish.selected) {
            return dish;
          }
          return {
            ...dish,
            assignedPersonIds: selectedPeopleIds,
            selected: false
          };
        })
      };
    }

    case "RESTORE_STATE": {
      return action.payload;
    }

    case "RESET_ALL": {
      dishCounter = 0;
      return initialState;
    }

    default: {
      return state;
    }
  }
}
