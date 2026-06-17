import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-indigo-600">LeadConnect Pro</h1>
        <p className="text-gray-600">Build is working!</p>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<div className="mt-4">Dashboard Page</div>} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </div>
    </BrowserRouter>
  );
}

export default App;
