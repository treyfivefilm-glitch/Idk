import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function AccountPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Account" />
      <EmptyState title="Coming soon" message="Plan & billing management is being built next." />
    </div>
  );
}
