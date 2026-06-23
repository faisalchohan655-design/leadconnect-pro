// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Users, Phone, Globe, Star, TrendingUp, Award, UserCheck, UserPlus } from 'lucide-react';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withPhone: 0,
    withWebsite: 0,
    highRated: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0
  });

  const API_URL = 'https://leadconnect-backend-production.up.railway.app/api';

  // ==========================================
  // FETCH LEADS
  // ==========================================
  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_URL}/leads`);
      const data = await res.json();
      setLeads(data || []);
      updateStats(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATS
  // ==========================================
  const updateStats = (data) => {
    setStats({
      total: data.length,
      withPhone: data.filter(l => l.phone).length,
      withWebsite: data.filter(l => l.website).length,
      highRated: data.filter(l => l.rating >= 4).length,
      new: data.filter(l => l.status === 'new' || !l.status).length,
      contacted: data.filter(l => l.status === 'contacted').length,
      qualified: data.filter(l => l.status === 'qualified').length,
      converted: data.filter(l => l.status === 'converted' || l.status === 'closed').length
    });
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // LAST 7 DAYS DATA
  // ==========================================
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = leads.filter(l => {
        const created = new Date(l.createdAt);
        return created.toISOString().split('T')[0] === dateStr;
      }).length || 0;
      days.push({ date: dateStr, count });
    }
    return days;
  };

  const chartData = getLast7Days();

  // ==========================================
  // RATING DISTRIBUTION
  // ==========================================
  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    name: `${r}★`,
    count: leads.filter(l => Math.floor(l.rating || 0) === r).length || 0
  }));

  // ==========================================
  // PHONE AVAILABILITY
  // ==========================================
  const phoneData = [
    { name: 'With Phone', value: stats.withPhone },
    { name: 'No Phone', value: stats.total - stats.withPhone }
  ];

  const COLORS = ['#7c3aed', '#e5e7eb'];
  const STATUS_COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#ec4899'];

  // ==========================================
  // STATUS DATA (for pie chart)
  // ==========================================
  const statusData = [
    { name: 'New', value: stats.new },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Qualified', value: stats.qualified },
    { name: 'Converted', value: stats.converted }
  ];

  // ==========================================
  // MAIN STAT CARDS
  // ==========================================
  const statCards = [
    {
      title: 'Total Leads',
      value: stats.total,
      icon: <Users className="text-purple-500" size={24} />,
      bg: 'bg-purple-100',
      color: 'text-purple-600'
    },
    {
      title: 'With Phone',
      value: stats.withPhone,
      icon: <Phone className="text-blue-500" size={24} />,
      bg: 'bg-blue-100',
      color: 'text-blue-600'
    },
    {
      title: 'With Website',
      value: stats.withWebsite,
      icon: <Globe className="text-green-500" size={24} />,
      bg: 'bg-green-100',
      color: 'text-green-600'
    },
    {
      title: '4+ Stars',
      value: stats.highRated,
      icon: <Star className="text-yellow-500" size={24} />,
      bg: 'bg-yellow-100',
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500">Overview of your lead generation activities</p>
      </div>

      {/* ==========================================
          STAT CARDS
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`${card.bg} p-3 rounded-xl`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ==========================================
          SECONDARY STAT CARDS
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg"><UserPlus className="text-purple-500" size={20} /></div>
            <div>
              <p className="text-xs text-gray-400">New Leads</p>
              <p className="text-lg font-bold">{stats.new}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><UserCheck className="text-blue-500" size={20} /></div>
            <div>
              <p className="text-xs text-gray-400">Contacted</p>
              <p className="text-lg font-bold">{stats.contacted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg"><Award className="text-green-500" size={20} /></div>
            <div>
              <p className="text-xs text-gray-400">Qualified</p>
              <p className="text-lg font-bold">{stats.qualified}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-lg"><TrendingUp className="text-pink-500" size={20} /></div>
            <div>
              <p className="text-xs text-gray-400">Converted</p>
              <p className="text-lg font-bold">{stats.converted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          LEADS LAST 7 DAYS - LINE CHART
          ========================================== */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">📈 Leads (Last 7 Days)</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(d) => {
                  const dt = new Date(d);
                  return `${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#7c3aed" 
                strokeWidth={2} 
                dot={{ fill: '#7c3aed', r: 4 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ==========================================
          THREE CHARTS - PIE + PIE + BAR
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Phone Availability */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">📱 Phone Availability</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={phoneData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {phoneData.map((e, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Status */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">🔄 Lead Status</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">⭐ Rating Distribution</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
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

      {/* ==========================================
          RECENT LEADS TABLE
          ========================================== */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">📋 Recent Leads</h3>
          <span className="text-sm text-gray-400">{stats.total} total leads</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users size={48} className="mx-auto mb-2 opacity-30" />
            <p>No leads yet</p>
            <p className="text-sm">Search and save leads from Social or Domain Insights</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{lead.name || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.email || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.source || '-'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lead.status === 'new' || !lead.status ? 'bg-purple-100 text-purple-600' :
                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-600' :
                        lead.status === 'qualified' ? 'bg-green-100 text-green-600' :
                        'bg-pink-100 text-pink-600'
                      }`}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {lead.rating ? `${lead.rating}★` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
