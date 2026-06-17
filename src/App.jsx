import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <h1 className="text-3xl font-bold">LeadConnect Pro</h1>
        <p>Build is working!</p>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
