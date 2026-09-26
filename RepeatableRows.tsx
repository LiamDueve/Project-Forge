import { ReactNode } from "react";

export function RepeatableRows<T extends { id: string }>({
  items,
  onChange,
  renderRow,
  newItem,
  addLabel,
  emptyHint,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderRow: (item: T, update: (patch: Partial<T>) => void, remove: () => void) => ReactNode;
  newItem: () => T;
  addLabel: string;
  emptyHint?: string;
}) {
  function updateItem(id: string, patch: Partial<T>) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id: string) {
    onChange(items.filter((it) => it.id !== id));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && emptyHint && <p className="text-xs text-graphite">{emptyHint}</p>}
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-line bg-white p-3">
          {renderRow(item, (patch) => updateItem(item.id, patch), () => removeItem(item.id))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="focus-ring rounded-full border border-line bg-white px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}
