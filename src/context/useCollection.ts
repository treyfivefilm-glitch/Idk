import { useContext } from 'react';
import { CollectionContext, type CollectionContextValue } from './collection-context';

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within a CollectionProvider');
  return ctx;
}
