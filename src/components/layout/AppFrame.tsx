import type { ReactNode } from 'react';

/**
 * Constrains the app to a phone-sized column everywhere, and adds a
 * device-like frame on wider viewports so it reads as a native app rather
 * than a responsive website, while staying edge-to-edge on real phones.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen-safe min-h-screen bg-paper-muted sm:py-6">
      <div className="mx-auto flex min-h-screen-safe min-h-screen w-full max-w-[440px] flex-col bg-paper-muted sm:min-h-[840px] sm:rounded-[2rem] sm:shadow-2xl sm:ring-1 sm:ring-white/10 sm:overflow-hidden">
        {children}
      </div>
    </div>
  );
}
