import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('✅ main.jsx is running');

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ Render completed');
} catch (err) {
  console.error('❌ Render error:', err);
  document.getElementById('root').innerHTML =
    '<pre style="color:red;font-size:16px;">' + err.message + '</pre>';
}
