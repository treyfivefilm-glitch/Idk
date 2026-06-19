import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppFrame } from './components/layout/AppFrame';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { CollectionPage } from './pages/CollectionPage';
import { AccountPage } from './pages/AccountPage';
import { ResultsPage } from './pages/ResultsPage';
import { ComicDetailPage } from './pages/ComicDetailPage';
import { ScanCoverPage } from './pages/ScanCoverPage';
import { ScanBarcodePage } from './pages/ScanBarcodePage';
import { PaywallPage } from './pages/PaywallPage';
import { CollectionProvider } from './context/CollectionContext';
import { BillingProvider } from './context/BillingContext';

function App() {
  return (
    <BillingProvider>
      <CollectionProvider>
        <BrowserRouter>
          <AppFrame>
            <Routes>
              <Route element={<RootLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/account" element={<AccountPage />} />
              </Route>
              <Route path="/results/:issueId" element={<ResultsPage />} />
              <Route path="/collection/:savedId" element={<ComicDetailPage />} />
              <Route path="/scan/cover" element={<ScanCoverPage />} />
              <Route path="/scan/barcode" element={<ScanBarcodePage />} />
              <Route path="/paywall" element={<PaywallPage />} />
            </Routes>
          </AppFrame>
        </BrowserRouter>
      </CollectionProvider>
    </BillingProvider>
  );
}

export default App;
