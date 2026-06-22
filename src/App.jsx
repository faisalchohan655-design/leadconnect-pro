import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import LocalBusinessInsights from './components/pages/LocalBusinessInsights';
import SocialInsights from './components/pages/SocialInsights';
import DomainInsights from './components/pages/DomainInsights';
import WebsiteIntelligence from './components/pages/WebsiteIntelligence';
import CampaignOutreach from './components/pages/CampaignOutreach';
import ConversationInbox from './components/pages/ConversationInbox';
import CRMPipeline from './components/pages/CRMPipeline';
import EmailMarketing from './components/pages/EmailMarketing';
import Settings from './components/pages/Settings';

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
            <Route path="/domain-insights" element={<DomainInsights />} />
            <Route path="/website-intelligence" element={<WebsiteIntelligence />} />
            <Route path="/campaign-outreach" element={<CampaignOutreach />} />
            <Route path="/conversation-inbox" element={<ConversationInbox />} />
            <Route path="/crm-pipeline" element={<CRMPipeline />} />
            <Route path="/email-marketing" element={<EmailMarketing />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
