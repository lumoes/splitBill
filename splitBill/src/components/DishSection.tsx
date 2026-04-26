import type { CurrencyCode, Dish, Person } from "../types/bill";
import { DishForm } from "./DishForm";
import { DishList } from "./DishList";

interface DishSectionProps {
  dishes: Dish[];
  people: Person[];
  baseCurrency: CurrencyCode;
  onAddDish: (payload: { name: string; amountCents: number }) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleSelected: (dishId: string) => void;
  onDeleteDish: (dishId: string) => void;
}

export function DishSection({
  dishes,
  people,
  baseCurrency,
  onAddDish,
  onSelectAll,
  onClearSelection,
  onToggleSelected,
  onDeleteDish
}: DishSectionProps) {
  const selectedCount = dishes.filter((dish) => dish.selected).length;

  return (
    <section className="card section">
      <div className="section-title-row">
        <h2>菜品清单</h2>
      </div>

      <DishForm onAdd={onAddDish} />

      <div className="select-toolbar">
        <span>已选 {selectedCount} 道菜</span>
        <div className="select-toolbar-actions">
          <button className="btn btn-small" type="button" onClick={onSelectAll}>
            全选
          </button>
          <button className="btn btn-small btn-ghost" type="button" onClick={onClearSelection}>
            清空
          </button>
        </div>
      </div>

      <DishList
        dishes={dishes}
        people={people}
        baseCurrency={baseCurrency}
        onToggleSelected={onToggleSelected}
        onDelete={onDeleteDish}
      />
    </section>
  );
}
