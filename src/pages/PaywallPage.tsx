import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function PaywallPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="PanelWorth Pro" showBack />
      <EmptyState title="Coming soon" message="Pricing & upgrade flow is being built next." />
    </div>
  );
}
