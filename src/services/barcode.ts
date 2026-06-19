import { getIssueByBarcode } from '../data/catalog';

export type BarcodeDecodeStatus = 'unsupported' | 'not-found' | 'decoded';

export interface BarcodeDecodeResult {
  status: BarcodeDecodeStatus;
  value?: string;
}

interface BarcodeDetectorLike {
  detect(image: ImageBitmapSource): Promise<{ rawValue: string }[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: string[] }) => BarcodeDetectorLike;
  }
}

/**
 * Real (non-stubbed) barcode decode using the browser's Barcode Detection API,
 * which most comics' UPC barcodes satisfy. Not all browsers support it (notably
 * Safari/Firefox at the time of writing) — callers must handle 'unsupported'
 * by falling back to manual barcode entry, which the ScanBarcode screen does.
 */
export async function decodeBarcodeFromImage(file: File): Promise<BarcodeDecodeResult> {
  if (typeof window === 'undefined' || !window.BarcodeDetector) {
    return { status: 'unsupported' };
  }

  try {
    const detector = new window.BarcodeDetector({
      formats: ['upc_a', 'upc_e', 'ean_13', 'ean_8'],
    });
    const bitmap = await createImageBitmap(file);
    const results = await detector.detect(bitmap);
    if (results.length === 0) {
      return { status: 'not-found' };
    }
    return { status: 'decoded', value: results[0].rawValue };
  } catch {
    return { status: 'not-found' };
  }
}

export function lookupBarcode(barcode: string) {
  return getIssueByBarcode(barcode.trim());
}
