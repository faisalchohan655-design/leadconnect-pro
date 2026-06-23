// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Users, Phone, Globe, Star } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000);
    return () => clearInterval(interval);
  }, []);

  const total = leads?.length || 0;
  const withPhone = leads?.filter(l => l.phone).length || 0;
  const withWebsite = leads?.filter(l => l.website).length || 0;
  const highRated = leads?.filter(l => l.rating >= 4).length || 0;

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = leads?.filter(l => {
        const created = new Date(l.createdAt || l.createdAt);
        return created.toISOString().split('T')[0] === dateStr;
      }).length || 0;
      days.push({ date: dateStr, count });
    }
    return days;
  };

  const chartData = getLast7Days();

  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    name: `${r}★`,
    count: leads?.filter(l => Math.floor(l.rating || 0) === r).length || 0
  }));

  const phoneData = [
    { name: 'With Phone', value: withPhone },
    { name: 'No Phone', value: total - withPhone }
  ];

  const COLORS = ['#7c3aed', '#e5e7eb'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Overview of your lead generation activities</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Leads</p>
              <p className="text-2xl font-bold">{total}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl"><Users className="text-purple-500" size={24} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">With Phone</p>
              <p className="text-2xl font-bold">{withPhone}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl"><Phone className="text-blue-500" size={24} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">With Website</p>
              <p className="text-2xl font-bold">{withWebsite}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl"><Globe className="text-green-500" size={24} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">4+ Stars</p>
              <p className="text-2xl font-bold">{highRated}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl"><Star className="text-yellow-500" size={24} /></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold mb-4">Leads (Last 7 Days)</h3>
        {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={d => `${String(new Date(d).getMonth()+1).padStart(2,'0')}-${String(new Date(d).getDate()).padStart(2,'0')}`} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Phone Availability</h3>
          {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={phoneData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                  {phoneData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold mb-4">Rating Distribution</h3>
          {loading ? <div className="text-center py-8 text-gray-400">Loading...</div> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
