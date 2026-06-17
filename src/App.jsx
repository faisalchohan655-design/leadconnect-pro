import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LeadsProvider } from './context/LeadsContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <LeadsProvider>
      <BrowserRouter>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </LeadsProvider>
  );
}

export default App;
