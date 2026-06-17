import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import LocalBusinessInsights from './components/pages/LocalBusinessInsights';
import SocialInsights from './components/pages/SocialInsights';
import CampaignOutreach from './components/pages/CampaignOutreach';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/local-business-insights" element={<LocalBusinessInsights />} />
            <Route path="/social-insights" element={<SocialInsights />} />
            <Route path="/campaign-outreach" element={<CampaignOutreach />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
