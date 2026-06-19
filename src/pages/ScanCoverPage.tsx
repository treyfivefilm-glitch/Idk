import { useId, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/Spinner';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { KeyIssueBadge } from '../components/KeyIssueBadge';
import { OwnedBadge } from '../components/OwnedBadge';
import { identifyByImage, LOW_CONFIDENCE_THRESHOLD, type RecognitionCandidate } from '../services/recognition';
import { useCollection } from '../context/useCollection';

type Step = 'idle' | 'identifying' | 'confirm' | 'error';

export function ScanCoverPage() {
  const navigate = useNavigate();
  const inputId = useId();
  const libraryInputId = useId();
  const { isSaved } = useCollection();
  const [step, setStep] = useState<Step>('idle');
  const [candidate, setCandidate] = useState<RecognitionCandidate | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(file);

    setStep('identifying');
    try {
      const result = await identifyByImage(file);
      const top = result.candidates[0];
      if (!top) {
        setStep('error');
        return;
      }
      setCandidate(top);
      setStep('confirm');
    } catch {
      setStep('error');
    }
  }

  const lowConfidence = candidate ? candidate.confidence < LOW_CONFIDENCE_THRESHOLD : false;

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Scan cover" showBack />

      <div className="flex flex-1 flex-col px-4 py-4">
        {step === 'idle' ? (
          <>
            <p className="text-sm text-ink-soft">
              Take a clear, well-lit photo of the front cover. We'll suggest a best guess for you to confirm — this
              is never automatic.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <CameraIllustration />
              <label
                htmlFor={inputId}
                className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
              >
                Take a photo
              </label>
              <input
                id={inputId}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <label htmlFor={libraryInputId} className="cursor-pointer text-sm font-semibold text-brand">
                Choose an existing photo
              </label>
              <input
                id={libraryInputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
            <Link to="/" className="mt-4 text-center text-sm font-semibold text-ink-soft hover:text-ink">
              Use manual search instead
            </Link>
          </>
        ) : null}

        {step === 'identifying' ? <Spinner label="Looking at the cover…" /> : null}

        {step === 'error' ? (
          <div className="mt-6 rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-sm font-semibold text-ink">We couldn't get a guess from that photo</p>
            <p className="mt-1 text-sm text-ink-soft">Try retaking the photo in better light, or search manually.</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink"
              >
                Try again
              </button>
              <Link to="/" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink-on-brand">
                Search instead
              </Link>
            </div>
          </div>
        ) : null}

        {step === 'confirm' && candidate ? (
          <div className="mt-2">
            <p className="text-sm font-semibold text-ink">Is this your comic?</p>
            <p className="mt-1 text-xs text-ink-soft">
              This is a best guess from the photo, not a certain match — please confirm.
            </p>

            {lowConfidence ? (
              <p className="mt-3 rounded-xl bg-danger-soft p-3 text-xs font-medium text-danger">
                We're not very confident about this one. Double-check the title and issue number below, or use
                manual search instead.
              </p>
            ) : null}

            <div className="mt-3 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">
                    {candidate.issue.title} {candidate.issue.issueNumber}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {candidate.issue.publisher} · {candidate.issue.year}
                  </p>
                </div>
                {candidate.issue.isKeyIssue ? <KeyIssueBadge /> : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <ConfidenceBadge confidence={candidate.confidence} />
                {isSaved(candidate.issue.id) ? <OwnedBadge /> : null}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-ink"
              >
                Not this one
              </button>
              <button
                type="button"
                onClick={() => navigate(`/results/${candidate.issue.id}`)}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
              >
                Yes, that's it
              </button>
            </div>
            <Link to="/" className="mt-3 block text-center text-sm font-semibold text-ink-soft hover:text-ink">
              Use manual search instead
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CameraIllustration() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-ink-soft" aria-hidden="true">
      <path
        d="M4 8.5A1.5 1.5 0 015.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0120 8.5v9A1.5 1.5 0 0118.5 19h-13A1.5 1.5 0 014 17.5v-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
