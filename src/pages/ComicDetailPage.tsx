import { useEffect, useId, useState, type ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { ConditionSelector } from '../components/ConditionSelector';
import { ValueRangeCard } from '../components/ValueRangeCard';
import { useCollection } from '../context/useCollection';
import { getIssueById } from '../data/catalog';
import { fetchValue } from '../services/value';
import { calculateBand, adjustBandForCondition, sampleNote } from '../lib/valuation';
import type { Condition, GradedSale, GradingCompany, RawListing, SavedComic, ValueBand } from '../types/comic';

export function ComicDetailPage() {
  const { savedId } = useParams<{ savedId: string }>();
  const navigate = useNavigate();
  const { items, collections, updateItem, removeItem, loading } = useCollection();
  const coverInputId = useId();

  const saved = savedId ? items.find((i) => i.savedId === savedId) : undefined;
  const issue = saved ? getIssueById(saved.issueId) : undefined;

  const [valueState, setValueState] = useState<{
    issueId: string;
    rawBand: ValueBand<RawListing> | null;
    gradedBand: ValueBand<GradedSale> | null;
  } | null>(null);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  useEffect(() => {
    if (!issue) return;
    let active = true;
    fetchValue(issue.id).then((result) => {
      if (!active) return;
      setValueState({
        issueId: issue.id,
        rawBand: calculateBand(result.rawListings),
        gradedBand: calculateBand(result.gradedSales),
      });
    });
    return () => {
      active = false;
    };
  }, [issue]);

  const valueLoading = !issue || valueState?.issueId !== issue.id;
  const rawBand = issue && valueState?.issueId === issue.id ? valueState.rawBand : null;
  const gradedBand = issue && valueState?.issueId === issue.id ? valueState.gradedBand : null;

  function handleCoverFile(file: File | undefined) {
    if (!file || !saved) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateItem(saved.savedId, { personalCoverUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleRemove() {
    if (!saved) return;
    await removeItem(saved.savedId);
    navigate('/collection');
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Comic" showBack />
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (!saved || !issue) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Not found" showBack />
        <EmptyState
          title="We couldn't find that saved comic"
          message="It may have already been removed."
          action={
            <Link to="/collection" className="text-sm font-semibold text-brand">
              Back to your collection
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader
        title={`${issue.title} ${issue.issueNumber}`}
        showBack
        right={
          <button
            type="button"
            onClick={() => setConfirmingRemove(true)}
            aria-label="Remove from collection"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-slate-100 hover:text-danger"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M5 6h14M9 6V4.5A1.5 1.5 0 0110.5 3h3A1.5 1.5 0 0115 4.5V6m2 0l-.6 13.2A1.8 1.8 0 0114.6 21H9.4a1.8 1.8 0 01-1.8-1.8L7 6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        }
      />

      <div className="space-y-5 px-4 py-4">
        {confirmingRemove ? (
          <div className="rounded-xl bg-danger-soft p-3">
            <p className="text-sm text-danger">
              Remove {issue.title} {issue.issueNumber} from your collection?
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={handleRemove}
                className="rounded-full bg-danger px-3 py-1.5 text-sm font-semibold text-white"
              >
                Yes, remove
              </button>
              <button
                type="button"
                onClick={() => setConfirmingRemove(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex gap-4">
          <div className="flex h-32 w-24 flex-none items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-brand-dark">
            {saved.personalCoverUrl || issue.coverImageUrl ? (
              <img src={saved.personalCoverUrl ?? issue.coverImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold">{issue.issueNumber}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">
              {issue.title} {issue.issueNumber}
            </p>
            <p className="text-sm text-ink-soft">
              {issue.publisher} · {issue.year}
            </p>
            {issue.isKeyIssue ? (
              <div className="mt-1">
                <KeyIssueBadge />
              </div>
            ) : null}
            <label htmlFor={coverInputId} className="mt-2 inline-block cursor-pointer text-xs font-semibold text-brand">
              {saved.personalCoverUrl ? 'Replace your photo' : 'Add a photo of your copy'}
            </label>
            <input
              id={coverInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleCoverFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="box-select">
            Box
          </label>
          <select
            id="box-select"
            value={saved.collectionId}
            onChange={(e) => updateItem(saved.savedId, { collectionId: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-paper px-3 py-2.5 text-sm text-ink"
          >
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <ConditionSelector
            value={saved.condition}
            onChange={(condition: Condition) => updateItem(saved.savedId, { condition, isSlabbed: false })}
            graded={{
              selected: saved.isSlabbed,
              technical:
                saved.gradingCompany && saved.grade ? `${saved.gradingCompany} ${saved.grade.toFixed(1)}` : 'CGC / CBCS',
              onSelect: () => updateItem(saved.savedId, { isSlabbed: true }),
            }}
          />

          {saved.isSlabbed ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-ink-soft" htmlFor="grading-company">
                  Grading company
                </label>
                <select
                  id="grading-company"
                  value={saved.gradingCompany ?? ''}
                  onChange={(e) =>
                    updateItem(saved.savedId, {
                      gradingCompany: (e.target.value || undefined) as GradingCompany | undefined,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-paper px-3 py-2 text-sm text-ink"
                >
                  <option value="">Select…</option>
                  <option value="CGC">CGC</option>
                  <option value="CBCS">CBCS</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-soft" htmlFor="grade-input">
                  Grade
                </label>
                <input
                  id="grade-input"
                  type="number"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={saved.grade ?? ''}
                  onChange={(e) =>
                    updateItem(saved.savedId, { grade: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">What it's worth</h3>
          {valueLoading ? (
            <Spinner label="Pricing your copy…" />
          ) : saved.isSlabbed ? (
            <ValueRangeCard
              title="Your copy"
              subtitle="actual sales"
              band={gradedBand}
              accent="brand"
              emptyMessage="Not enough recent graded sales for this issue to price reliably."
              note={sampleNote(gradedBand, 'real sales')}
            />
          ) : (
            <ValueRangeCard
              title="Your copy"
              subtitle="currently asking"
              band={rawBand ? adjustBandForCondition(rawBand, saved.condition) : null}
              accent="value"
              emptyMessage="Not enough recent listings for this issue to price reliably."
              note={sampleNote(rawBand, 'real asking prices')}
            />
          )}
          <Link to={`/results/${issue.id}`} className="mt-2 inline-block text-xs font-semibold text-brand">
            See full comps &amp; "how we calculated this" →
          </Link>
        </div>

        <PersonalFields saved={saved} onChange={(patch) => updateItem(saved.savedId, patch)} />
      </div>
    </div>
  );
}

function PersonalFields({
  saved,
  onChange,
}: {
  saved: SavedComic;
  onChange(patch: Partial<SavedComic>): void;
}) {
  const [purchasePrice, setPurchasePrice] = useState(saved.purchasePrice?.toString() ?? '');
  const [purchaseDate, setPurchaseDate] = useState(saved.purchaseDate ?? '');
  const [storageBox, setStorageBox] = useState(saved.storageBox ?? '');
  const [signedBy, setSignedBy] = useState(saved.signedBy ?? '');
  const [notes, setNotes] = useState(saved.notes ?? '');

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-ink">Your records</p>

      <Field label="Purchase price">
        <input
          type="number"
          min={0}
          step={0.01}
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          onBlur={() => onChange({ purchasePrice: purchasePrice ? Number(purchasePrice) : undefined })}
          placeholder="$0"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
        />
      </Field>

      <Field label="Purchase date">
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          onBlur={() => onChange({ purchaseDate: purchaseDate || undefined })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink"
        />
      </Field>

      <Field label="Storage location">
        <input
          type="text"
          value={storageBox}
          onChange={(e) => setStorageBox(e.target.value)}
          onBlur={() => onChange({ storageBox: storageBox.trim() || undefined })}
          placeholder="e.g. Box 3, closet shelf"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
        />
      </Field>

      <Field label="Signed by">
        <input
          type="text"
          value={signedBy}
          onChange={(e) => setSignedBy(e.target.value)}
          onBlur={() => onChange({ signedBy: signedBy.trim() || undefined })}
          placeholder="e.g. Stan Lee"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onChange({ notes: notes.trim() || undefined })}
          rows={3}
          placeholder="Anything else worth remembering about this copy"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-ink-soft">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
