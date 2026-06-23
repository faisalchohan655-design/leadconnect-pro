// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Star, Phone, Globe, Award, TrendingUp, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, withPhone: 0, withWebsite: 0, highRated: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ DIRECT API URL - NO IMPORT NEEDED
  const API_URL = 'https://leadconnect-backend-production.up.railway.app/api';

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leads`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      console.log('✅ Leads:', data?.length || 0);
      setLeads(data);
      // Update stats...
    } catch (err) {
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ... rest of code
};

export default Dashboard;
