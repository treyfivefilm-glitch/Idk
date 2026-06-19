import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function ScanCoverPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Scan cover" showBack />
      <EmptyState title="Coming soon" message="Cover scanning is being built next." />
    </div>
  );
}
