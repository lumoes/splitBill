import type { CurrencyCode, Dish, Person } from "../types/bill";
import { DishItem } from "./DishItem";

interface DishListProps {
  dishes: Dish[];
  people: Person[];
  baseCurrency: CurrencyCode;
  onToggleSelected: (dishId: string) => void;
  onDelete: (dishId: string) => void;
}

export function DishList({ dishes, people, baseCurrency, onToggleSelected, onDelete }: DishListProps) {
  if (dishes.length === 0) {
    return <p className="empty-state">还没加菜，先把小票上的菜名和金额填进来。</p>;
  }

  return (
    <div className="dish-list">
      {dishes.map((dish) => (
        <DishItem
          key={dish.id}
          dish={dish}
          people={people}
          baseCurrency={baseCurrency}
          onToggleSelected={onToggleSelected}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
