import type { CurrencyCode, Dish, Person } from "../types/bill";
import { formatCents } from "../utils/format";

interface DishItemProps {
  dish: Dish;
  people: Person[];
  baseCurrency: CurrencyCode;
  onToggleSelected: (dishId: string) => void;
  onDelete: (dishId: string) => void;
}

export function DishItem({ dish, people, baseCurrency, onToggleSelected, onDelete }: DishItemProps) {
  const assigneeNames = dish.assignedPersonIds
    .map((id) => people.find((person) => person.id === id)?.name ?? "")
    .filter(Boolean);

  return (
    <article
      className="dish-item dish-item-optional"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/dish-id", dish.id);
      }}
    >
      <div className="dish-head">
        <label className="dish-check">
          <input
            type="checkbox"
            checked={dish.selected}
            onChange={() => onToggleSelected(dish.id)}
          />
          <span>{dish.name}</span>
        </label>
        <strong>{formatCents(dish.amountCents, baseCurrency)}</strong>
      </div>

      <p className="muted-text">
        {assigneeNames.length > 0 ? `已分给：${assigneeNames.join("、")}` : "尚未分配，拖动到右侧人物卡片可快速指派"}
      </p>

      <div className="dish-actions">
        <button className="btn btn-small btn-ghost" type="button" onClick={() => onDelete(dish.id)}>
          删除
        </button>
      </div>
    </article>
  );
}
