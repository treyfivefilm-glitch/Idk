import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/EmptyState';

export function ScanBarcodePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title="Scan barcode" showBack />
      <EmptyState title="Coming soon" message="Barcode scanning is being built next." />
    </div>
  );
}
