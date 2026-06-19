import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { UpsellCard } from '../components/UpsellCard';
import { BoxTabs } from '../components/BoxTabs';
import { CollectionToolbar, type SortMode, type GroupMode } from '../components/CollectionToolbar';
import { HoldingListRow, type FlatBand } from '../components/HoldingListRow';
import { ValueSummaryCard } from '../components/ValueSummaryCard';
import { useCollection } from '../context/useCollection';
import { useBilling } from '../context/useBilling';
import { getIssueById } from '../data/catalog';
import { fetchValue } from '../services/value';
import { calculateBand, adjustBandForCondition } from '../lib/valuation';
import { seededPercentChange } from '../lib/history';
import { FREE_COLLECTION_LIMIT } from '../lib/limits';
import { CONDITIONS } from '../types/comic';
import type { Collection, ComicIssue, GradedSale, RawListing, SavedComic, ValueBand } from '../types/comic';

interface Entry {
  saved: SavedComic;
  issue: ComicIssue;
}

interface IssueBands {
  raw: ValueBand<RawListing> | null;
  graded: ValueBand<GradedSale> | null;
}

function flatten<T extends { price: number }>(band: ValueBand<T>): FlatBand {
  return { low: band.low, median: band.median, high: band.high };
}

function gradeGroupLabel(saved: SavedComic): string {
  if (saved.isSlabbed) {
    return saved.gradingCompany && saved.grade != null ? `${saved.gradingCompany} ${saved.grade.toFixed(1)}` : 'Graded';
  }
  return CONDITIONS.find((c) => c.value === saved.condition)?.label ?? saved.condition;
}

function groupKeysFor(entry: Entry, group: GroupMode, collections: Collection[]): string[] {
  switch (group) {
    case 'series':
      return [entry.issue.title];
    case 'creator':
      return entry.issue.creators;
    case 'grade':
      return [gradeGroupLabel(entry.saved)];
    case 'box':
      return [collections.find((c) => c.id === entry.saved.collectionId)?.name ?? 'Unfiled'];
    default:
      return [''];
  }
}

function buildCsv(rows: Entry[], collections: Collection[], bandFor: (saved: SavedComic) => FlatBand | null): string {
  const header =
    'Title,Issue,Year,Publisher,Box,Slabbed,Grade,Grading Company,Condition,Purchase Price,Purchase Date,Storage,Signed By,Notes,Low,Median,High\n';
  const lines = rows.map(({ saved, issue }) => {
    const band = bandFor(saved);
    const boxName = collections.find((c) => c.id === saved.collectionId)?.name ?? '';
    return [
      issue.title,
      issue.issueNumber,
      issue.year,
      issue.publisher,
      boxName,
      saved.isSlabbed ? 'Yes' : 'No',
      saved.grade ?? '',
      saved.gradingCompany ?? '',
      saved.isSlabbed ? '' : saved.condition,
      saved.purchasePrice ?? '',
      saved.purchaseDate ?? '',
      saved.storageBox ?? '',
      saved.signedBy ?? '',
      saved.notes ?? '',
      band?.low ?? '',
      band?.median ?? '',
      band?.high ?? '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',');
  });
  return header + lines.join('\n');
}

export function CollectionPage() {
  const { collections, items, loading: itemsLoading, createCollection, renameCollection, deleteCollection } =
    useCollection();
  const { isPro } = useBilling();

  const [activeBoxId, setActiveBoxId] = useState<string | 'all'>('all');
  const [sort, setSort] = useState<SortMode>('value');
  const [group, setGroup] = useState<GroupMode>('none');

  const [creatingBox, setCreatingBox] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [editingBoxName, setEditingBoxName] = useState(false);
  const [boxNameDraft, setBoxNameDraft] = useState('');
  const [confirmDeleteBox, setConfirmDeleteBox] = useState(false);

  const [valueMap, setValueMap] = useState<Record<string, IssueBands>>({});

  const effectiveGroup: GroupMode = activeBoxId !== 'all' && group === 'box' ? 'none' : group;

  function selectBox(id: string | 'all') {
    setActiveBoxId(id);
    setEditingBoxName(false);
    setConfirmDeleteBox(false);
  }

  useEffect(() => {
    let active = true;
    const uniqueIssueIds = Array.from(new Set(items.map((i) => i.issueId)));

    Promise.all(
      uniqueIssueIds.map(async (issueId) => {
        const result = await fetchValue(issueId);
        return [issueId, { raw: calculateBand(result.rawListings), graded: calculateBand(result.gradedSales) }] as const;
      }),
    ).then((entries) => {
      if (active) setValueMap(Object.fromEntries(entries));
    });

    return () => {
      active = false;
    };
  }, [items]);

  function resolveBand(saved: SavedComic): FlatBand | null {
    const bands = valueMap[saved.issueId];
    if (!bands) return null;
    if (saved.isSlabbed) {
      return bands.graded ? flatten(bands.graded) : null;
    }
    return bands.raw ? flatten(adjustBandForCondition(bands.raw, saved.condition)) : null;
  }

  const enriched = useMemo<Entry[]>(
    () =>
      items
        .map((saved) => ({ saved, issue: getIssueById(saved.issueId) }))
        .filter((e): e is Entry => Boolean(e.issue)),
    [items],
  );

  const filtered = useMemo(
    () => (activeBoxId === 'all' ? enriched : enriched.filter((e) => e.saved.collectionId === activeBoxId)),
    [enriched, activeBoxId],
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'series') {
      arr.sort((a, b) =>
        `${a.issue.title} ${a.issue.issueNumber}`.localeCompare(`${b.issue.title} ${b.issue.issueNumber}`),
      );
    } else if (sort === 'gain') {
      arr.sort((a, b) => seededPercentChange(b.issue.id) - seededPercentChange(a.issue.id));
    } else if (sort === 'value') {
      arr.sort((a, b) => {
        const bandA = resolveBand(a.saved)?.median ?? -1;
        const bandB = resolveBand(b.saved)?.median ?? -1;
        return bandB - bandA;
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sort, valueMap]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const entry of sorted) {
      for (const key of groupKeysFor(entry, effectiveGroup, collections)) {
        const list = map.get(key) ?? [];
        list.push(entry);
        map.set(key, list);
      }
    }
    return map;
  }, [sorted, effectiveGroup, collections]);

  const groupKeysOrdered =
    effectiveGroup === 'none' ? [''] : Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));

  const summary = useMemo(() => {
    let low = 0;
    let high = 0;
    let pricedCount = 0;
    for (const entry of sorted) {
      const band = resolveBand(entry.saved);
      if (band) {
        low += band.low;
        high += band.high;
        pricedCount++;
      }
    }
    return { low, high, pricedCount, totalCount: sorted.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, valueMap]);

  const activeBox = activeBoxId === 'all' ? undefined : collections.find((c) => c.id === activeBoxId);

  async function handleCreateBox() {
    const name = newBoxName.trim();
    if (!name) return;
    const entry = await createCollection(name);
    setNewBoxName('');
    setCreatingBox(false);
    selectBox(entry.id);
  }

  async function handleSaveBoxName() {
    const name = boxNameDraft.trim();
    if (!name || !activeBox) {
      setEditingBoxName(false);
      return;
    }
    await renameCollection(activeBox.id, name);
    setEditingBoxName(false);
  }

  async function handleDeleteBox() {
    if (!activeBox) return;
    await deleteCollection(activeBox.id);
    selectBox('all');
  }

  function handleExport() {
    const csv = buildCsv(sorted, collections, resolveBand);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panelworth-collection.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (itemsLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Collection" />
        <Spinner label="Loading your collection…" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Collection" />
        <EmptyState
          title="Nothing saved yet"
          message="Scan a cover or barcode, or search for a comic, then add it here to track its value."
          action={
            <Link to="/" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-on-brand">
              Find your first comic
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Collection" />

      <div className="space-y-4 px-4 py-4">
        <ValueSummaryCard
          seedKey={activeBoxId}
          low={summary.low}
          high={summary.high}
          pricedCount={summary.pricedCount}
          totalCount={summary.totalCount}
          isPro={isPro}
        />

        {!isPro && items.length >= FREE_COLLECTION_LIMIT ? (
          <UpsellCard message={`Your free collection is capped at ${FREE_COLLECTION_LIMIT} comics. Go Pro for unlimited boxes.`} />
        ) : null}

        <BoxTabs
          collections={collections}
          activeId={activeBoxId}
          onSelect={selectBox}
          onCreateNew={() => setCreatingBox(true)}
        />

        {creatingBox ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={newBoxName}
              onChange={(e) => setNewBoxName(e.target.value)}
              placeholder="Box name"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink placeholder:text-ink-soft"
            />
            <button
              type="button"
              onClick={handleCreateBox}
              className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-ink-on-brand"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setCreatingBox(false);
                setNewBoxName('');
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink-soft"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {activeBox ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            {editingBoxName ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={boxNameDraft}
                  onChange={(e) => setBoxNameDraft(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm text-ink"
                />
                <button type="button" onClick={handleSaveBoxName} className="font-semibold text-brand">
                  Save
                </button>
                <button type="button" onClick={() => setEditingBoxName(false)} className="text-ink-soft">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setBoxNameDraft(activeBox.name);
                  setEditingBoxName(true);
                }}
                className="font-semibold text-ink hover:underline"
              >
                Rename "{activeBox.name}"
              </button>
            )}
            {!editingBoxName ? (
              confirmDeleteBox ? (
                <div className="flex items-center gap-2">
                  <span className="text-danger">Delete this box and its items?</span>
                  <button type="button" onClick={handleDeleteBox} className="font-semibold text-danger">
                    Yes
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteBox(false)} className="text-ink-soft">
                    No
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDeleteBox(true)} className="text-danger">
                  Delete box
                </button>
              )
            ) : null}
          </div>
        ) : null}

        <CollectionToolbar
          sort={sort}
          onSortChange={setSort}
          group={effectiveGroup}
          onGroupChange={setGroup}
          showBoxGroup={activeBoxId === 'all'}
        />

        {isPro ? (
          <button
            type="button"
            onClick={handleExport}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-ink hover:border-slate-300"
          >
            Export collection (CSV)
          </button>
        ) : (
          <UpsellCard message="Export your collection to a spreadsheet with PanelWorth Pro." />
        )}

        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">Nothing in this box yet.</p>
        ) : (
          <div className="space-y-5">
            {groupKeysOrdered.map((key) => {
              const groupItems = grouped.get(key) ?? [];
              if (groupItems.length === 0) return null;
              return (
                <div key={key || 'all'}>
                  {key ? <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{key}</h3> : null}
                  <div className="space-y-2">
                    {groupItems.map(({ saved, issue }) => (
                      <HoldingListRow
                        key={saved.savedId}
                        saved={saved}
                        issue={issue}
                        band={resolveBand(saved)}
                        loading={!(saved.issueId in valueMap)}
                        percentChange={seededPercentChange(issue.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
