import { useMemo, useReducer, useState } from "react";
import { BillInfoSection } from "./components/BillInfoSection";
import { DishSection } from "./components/DishSection";
import { PageHeader } from "./components/PageHeader";
import { PeopleSection } from "./components/PeopleSection";
import backIcon from "./img/back.jpeg";
import { billReducer } from "./store/billReducer";
import { initialState } from "./store/initialState";
import type { BillState } from "./types/bill";
import { getPersonSummaries, getTotals } from "./utils/calc";

function cloneState(state: BillState): BillState {
  return JSON.parse(JSON.stringify(state)) as BillState;
}

export default function App() {
  const [state, dispatch] = useReducer(billReducer, initialState);
  const [undoStack, setUndoStack] = useState<BillState[]>([]);

  const totals = useMemo(() => getTotals(state), [state]);
  const summaries = useMemo(() => getPersonSummaries(state), [state]);
  const personTotals = useMemo(
    () => new Map(summaries.map((summary) => [summary.personId, summary.totalCents])),
    [summaries]
  );

  const selectedDishCount = state.dishes.filter((dish) => dish.selected).length;
  const selectedPeopleCount = state.people.filter((person) => person.selected).length;

  const handleReset = () => {
    dispatch({ type: "RESET_ALL" });
    setUndoStack([]);
  };

  const pushUndoState = () => {
    setUndoStack((prev) => [...prev, cloneState(state)]);
  };

  const handleDragAssignDish = (dishId: string, personId: string) => {
    pushUndoState();
    dispatch({ type: "ASSIGN_DISH_TO_PERSON", payload: { dishId, personId } });
  };

  const handleBulkAssign = () => {
    if (selectedDishCount === 0 || selectedPeopleCount === 0) {
      window.alert("请先选择菜品和人物，再执行分配。");
      return;
    }
    pushUndoState();
    dispatch({ type: "ASSIGN_SELECTED_DISHES_TO_SELECTED_PEOPLE" });
  };

  const handleUndo = () => {
    setUndoStack((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const snapshot = prev[prev.length - 1];
      dispatch({ type: "RESTORE_STATE", payload: snapshot });
      return prev.slice(0, -1);
    });
  };

  return (
    <main className="app-shell">
      <PageHeader onReset={handleReset} />

      <BillInfoSection
        billInput={state.billInput}
        totals={totals}
        onUpdate={(next) => dispatch({ type: "UPDATE_BILL_FIELD", payload: next })}
        onToggleCollapsed={(collapsed) =>
          dispatch({ type: "TOGGLE_BILL_COLLAPSED", payload: collapsed })
        }
      />

      <section className="workspace-grid">
        <div className="workspace-left">
          <DishSection
            dishes={state.dishes}
            people={state.people}
            baseCurrency={state.billInput.baseCurrency}
            onAddDish={(payload) => dispatch({ type: "ADD_DISH", payload })}
            onSelectAll={() => dispatch({ type: "SELECT_ALL_DISHES" })}
            onClearSelection={() => dispatch({ type: "CLEAR_DISH_SELECTION" })}
            onToggleSelected={(dishId) =>
              dispatch({ type: "TOGGLE_DISH_SELECTED", payload: { dishId } })
            }
            onDeleteDish={(dishId) => dispatch({ type: "DELETE_DISH", payload: { dishId } })}
          />
        </div>

        <div className="workspace-right">
          <PeopleSection
            people={state.people}
            baseCurrency={state.billInput.baseCurrency}
            personTotals={personTotals}
            onSetPeopleCount={(count) => dispatch({ type: "SET_PEOPLE_COUNT", payload: count })}
            onRenamePerson={(personId, name) =>
              dispatch({ type: "RENAME_PERSON", payload: { personId, name } })
            }
            onTogglePersonSelected={(personId) =>
              dispatch({ type: "TOGGLE_PERSON_SELECTED", payload: { personId } })
            }
            onSelectAllPeople={() => dispatch({ type: "SELECT_ALL_PEOPLE" })}
            onClearPeopleSelection={() => dispatch({ type: "CLEAR_PEOPLE_SELECTION" })}
            onDropDishToPerson={handleDragAssignDish}
          />
        </div>
      </section>

      <div className="allocation-status card section">
        <span>未分配金额：</span>
        <strong>
          {new Intl.NumberFormat("zh-CN", {
            style: "currency",
            currency: state.billInput.baseCurrency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totals.unallocatedCents / 100)}
        </strong>
      </div>

      <button className="floating-assign" type="button" onClick={handleBulkAssign}>
        ✓ 分配
      </button>

      {undoStack.length > 0 && (
        <button className="floating-undo" type="button" onClick={handleUndo} aria-label="撤回上一步">
          <img className="floating-undo-icon" src={backIcon} alt="" />
        </button>
      )}
    </main>
  );
}
