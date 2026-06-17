import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import LocalBusinessInsights from './components/pages/LocalBusinessInsights';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/local-business-insights" element={<LocalBusinessInsights />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
