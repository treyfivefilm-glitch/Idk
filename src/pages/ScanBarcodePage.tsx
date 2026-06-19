import { useId, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Spinner } from '../components/Spinner';
import { decodeBarcodeFromImage, lookupBarcode } from '../services/barcode';

type Status = 'idle' | 'reading' | 'unsupported' | 'not-found' | 'no-match';

export function ScanBarcodePage() {
  const navigate = useNavigate();
  const inputId = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [scannedValue, setScannedValue] = useState('');
  const [manualValue, setManualValue] = useState('');

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setStatus('reading');
    const result = await decodeBarcodeFromImage(file);

    if (result.status === 'unsupported') {
      setStatus('unsupported');
      return;
    }
    if (result.status === 'not-found' || !result.value) {
      setStatus('not-found');
      return;
    }
    resolveBarcode(result.value);
  }

  function resolveBarcode(value: string) {
    const match = lookupBarcode(value);
    if (match) {
      navigate(`/results/${match.id}`);
      return;
    }
    setScannedValue(value);
    setStatus('no-match');
  }

  function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    if (manualValue.trim()) resolveBarcode(manualValue.trim());
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <PageHeader title="Scan barcode" showBack />

      <div className="flex flex-1 flex-col px-4 py-4">
        <p className="text-sm text-ink-soft">
          Modern issues usually have a UPC barcode on the cover. Older back issues often don't — search or cover
          scan works better for those.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <BarcodeIllustration />
          <label
            htmlFor={inputId}
            className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
          >
            Take a photo of the barcode
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
        </div>

        {status === 'reading' ? <Spinner label="Reading barcode…" /> : null}

        {status === 'unsupported' ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-soft">
            Your browser can't read barcodes from photos. Enter the number printed under the bars instead.
          </p>
        ) : null}

        {status === 'not-found' ? (
          <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">
            We couldn't read a barcode in that photo. Try again in better light, or enter the number manually.
          </p>
        ) : null}

        {status === 'no-match' ? (
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-soft">
            We read barcode {scannedValue}, but it's not in our demo catalog yet.{' '}
            <Link to="/" className="font-semibold text-brand">
              Try manual search
            </Link>
            .
          </p>
        ) : null}

        <form onSubmit={handleManualSubmit} className="mt-6">
          <label htmlFor="manual-barcode" className="text-sm font-semibold text-ink">
            Or enter the barcode number
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="manual-barcode"
              type="text"
              inputMode="numeric"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="e.g. 071486028703"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft focus-visible:border-brand"
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-ink-on-brand hover:bg-brand-dark"
            >
              Look up
            </button>
          </div>
        </form>

        <Link to="/" className="mt-6 text-center text-sm font-semibold text-ink-soft hover:text-ink">
          Use manual search instead
        </Link>
      </div>
    </div>
  );
}

function BarcodeIllustration() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-ink-soft" aria-hidden="true">
      <path d="M4 5v14M8 5v14M11 5v14M14 5v14M16.5 5v14M20 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
