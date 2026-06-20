import { useState } from 'react';
import { CONDITIONS } from '../types/comic';
import type { Condition } from '../types/comic';
import { BottomSheet } from './BottomSheet';

interface GradedOption {
  selected: boolean;
  /** Small mono subtitle under the "Graded" pill, e.g. "CGC / CBCS" or a specific "CGC 9.8". */
  technical: string;
  onSelect(): void;
}

interface ConditionSelectorProps {
  value: Condition;
  onChange(value: Condition): void;
  /** When provided, renders a trailing "Graded" pill alongside the plain condition tiers. */
  graded?: GradedOption;
}

export function ConditionSelector({ value, onChange, graded }: ConditionSelectorProps) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  return (
    <fieldset>
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-semibold text-ink">What kind of shape is it in?</legend>
        <button
          type="button"
          onClick={() => setExplainerOpen(true)}
          className="text-xs font-semibold text-brand underline-offset-2 hover:underline"
        >
          What do these mean?
        </button>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {CONDITIONS.map((condition) => {
          const selected = !graded?.selected && condition.value === value;
          return (
            <button
              key={condition.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(condition.value)}
              className={`flex-none rounded-xl border px-3 py-2.5 text-left transition-colors ${
                selected
                  ? 'border-brand bg-brand-soft text-brand-dark'
                  : 'border-slate-200 text-ink-soft hover:border-slate-300'
              }`}
            >
              <span className="block text-sm font-semibold">{condition.label}</span>
              <span className="mt-0.5 block font-mono text-[11px] leading-snug">{condition.technical}</span>
            </button>
          );
        })}
        {graded ? (
          <button
            type="button"
            aria-pressed={graded.selected}
            onClick={graded.onSelect}
            className={`flex-none rounded-xl border px-3 py-2.5 text-left transition-colors ${
              graded.selected
                ? 'border-brand bg-brand-soft text-brand-dark'
                : 'border-slate-200 text-ink-soft hover:border-slate-300'
            }`}
          >
            <span className="block text-sm font-semibold">Graded</span>
            <span className="mt-0.5 block font-mono text-[11px] leading-snug">{graded.technical}</span>
          </button>
        ) : null}
      </div>

      <BottomSheet open={explainerOpen} title="What do these mean?" onClose={() => setExplainerOpen(false)}>
        <ul className="space-y-3 text-sm text-ink-soft">
          <li>
            <span className="font-semibold text-ink">Well-worn — </span>
            Visible creases, tears, or heavy shelf wear, but still complete and readable.
          </li>
          <li>
            <span className="font-semibold text-ink">Good shape — </span>
            Normal handling wear with no major damage — the most common condition.
          </li>
          <li>
            <span className="font-semibold text-ink">Like-new — </span>
            Sharp corners and a glossy cover that still looks fresh.
          </li>
          {graded ? (
            <li>
              <span className="font-semibold text-ink">Graded — </span>
              Professionally inspected, sealed in a hard case, and given an official numeric grade by CGC or CBCS.
            </li>
          ) : null}
        </ul>
      </BottomSheet>
    </fieldset>
  );
}
