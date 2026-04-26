import type { Person } from "../types/bill";
import { formatCents } from "../utils/format";

interface PeopleSectionProps {
  people: Person[];
  baseCurrency: "CNY" | "HKD" | "USD" | "EUR";
  personTotals: Map<string, number>;
  onSetPeopleCount: (count: number) => void;
  onRenamePerson: (personId: string, name: string) => void;
  onTogglePersonSelected: (personId: string) => void;
  onSelectAllPeople: () => void;
  onClearPeopleSelection: () => void;
  onDropDishToPerson: (dishId: string, personId: string) => void;
}

export function PeopleSection({
  people,
  baseCurrency,
  personTotals,
  onSetPeopleCount,
  onRenamePerson,
  onTogglePersonSelected,
  onSelectAllPeople,
  onClearPeopleSelection,
  onDropDishToPerson
}: PeopleSectionProps) {
  const selectedCount = people.filter((person) => person.selected).length;

  return (
    <section className="card section">
      <div className="section-title-row">
        <h2>人物</h2>
        <div className="counter">
          <button
            className="btn btn-small"
            type="button"
            onClick={() => onSetPeopleCount(people.length - 1)}
          >
            -
          </button>
          <input
            aria-label="人数"
            type="number"
            min={1}
            max={30}
            value={people.length}
            onChange={(event) => onSetPeopleCount(Number.parseInt(event.target.value, 10) || 1)}
          />
          <button
            className="btn btn-small"
            type="button"
            onClick={() => onSetPeopleCount(people.length + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="select-toolbar person-toolbar">
        <span>已选 {selectedCount} 人</span>
        <div className="select-toolbar-actions">
          <button className="btn btn-small" type="button" onClick={onSelectAllPeople}>
            全选
          </button>
          <button className="btn btn-small btn-ghost" type="button" onClick={onClearPeopleSelection}>
            清空
          </button>
        </div>
      </div>

      <div className="people-grid people-grid-right">
        {people.map((person) => (
          <article
            key={person.id}
            className={`person-chip ${person.selected ? "person-chip-selected" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const dishId = event.dataTransfer.getData("text/dish-id");
              if (dishId) {
                onDropDishToPerson(dishId, person.id);
              }
            }}
          >
            <div className="person-control-row">
              <label className="person-select-check" aria-label={`${person.name} 选择分配目标`}>
                <input
                  type="checkbox"
                  checked={person.selected}
                  onChange={() => onTogglePersonSelected(person.id)}
                />
              </label>
              <input
                className="person-name-input"
                value={person.name}
                onChange={(event) => onRenamePerson(person.id, event.target.value)}
                maxLength={16}
              />
            </div>
            <p className="person-total">应付：{formatCents(personTotals.get(person.id) ?? 0, baseCurrency)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
