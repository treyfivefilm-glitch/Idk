import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function CollectionPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Collection" />
      <EmptyState title="Coming soon" message="Your saved collection is being built next." />
    </div>
  );
}
