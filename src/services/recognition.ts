import { CATALOG } from '../data/catalog';
import type { ComicIssue } from '../types/comic';

export interface RecognitionCandidate {
  issue: ComicIssue;
  /** 0–1 confidence score. Always show this to the user — never imply certainty. */
  confidence: number;
}

export interface RecognitionResult {
  candidates: RecognitionCandidate[];
}

/** Below this confidence, the UI should push the user toward manual search instead of trusting the guess. */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/**
 * ============================================================================
 * STUBBED — COVER RECOGNITION
 * ============================================================================
 * This ALWAYS returns a mock "best guess" pulled from the seed catalog, with
 * a randomized confidence score, regardless of what's actually in `photo`.
 * It exists only to exercise the confirm-before-trusting UI flow.
 *
 * To make this live, you need one of:
 *   - A custom-trained vision model (e.g. fine-tuned CLIP/ResNet embedding
 *     search against a labeled cover-image index) that you host yourself, or
 *   - A licensed third-party cover/image recognition API.
 *
 * Either way the contract should stay the same:
 *   1. Take the captured photo (Blob/File).
 *   2. Return one or more candidate issues, each with a genuine confidence
 *      score (not a constant).
 *   3. NEVER skip the user confirmation step in the UI — recognition from a
 *      photo is inherently uncertain (reprints, variant covers, damage,
 *      glare), so this must always be presented as a guess to confirm,
 *      and low-confidence results must route to manual search.
 *
 * Required env vars once live: depends on provider, e.g. RECOGNITION_API_KEY
 * (see README).
 * ============================================================================
 */
export async function identifyByImage(_photo: Blob | File): Promise<RecognitionResult> {
  await new Promise((resolve) => setTimeout(resolve, 900)); // simulate model inference latency

  const mockPick = CATALOG[Math.floor(Math.random() * CATALOG.length)];
  const mockConfidence = Math.round((0.45 + Math.random() * 0.45) * 100) / 100;

  return {
    candidates: [{ issue: mockPick, confidence: mockConfidence }],
  };
}
