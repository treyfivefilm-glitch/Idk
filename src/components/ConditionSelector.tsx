import { CONDITIONS } from '../types/comic';
import type { Condition } from '../types/comic';

interface ConditionSelectorProps {
  value: Condition;
  onChange(value: Condition): void;
}

export function ConditionSelector({ value, onChange }: ConditionSelectorProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">What kind of shape is it in?</legend>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {CONDITIONS.map((condition) => {
          const selected = condition.value === value;
          return (
            <button
              key={condition.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(condition.value)}
              className={`rounded-xl border px-2 py-3 text-left transition-colors ${
                selected
                  ? 'border-brand bg-brand-soft text-brand-dark'
                  : 'border-slate-200 text-ink-soft hover:border-slate-300'
              }`}
            >
              <span className="block text-sm font-semibold">{condition.label}</span>
              <span className="mt-0.5 block text-xs leading-snug">{condition.hint}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
