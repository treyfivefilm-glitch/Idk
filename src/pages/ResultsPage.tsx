import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function ResultsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Results" showBack />
      <EmptyState title="Coming soon" message="Valuation results are being built next." />
    </div>
  );
}
