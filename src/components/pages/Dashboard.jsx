// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { Users, Phone, Globe, Star } from 'lucide-react';

const Dashboard = () => {
  const { leads, fetchLeads } = useLeads();
  const [loading, setLoading] = useState(true);

  // ✅ Fetch on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLeads();
      setLoading(false);
    };
    loadData();
  }, []);

  // ✅ Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeads();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // STATS
  // ==========================================
  const totalLeads = leads?.length || 0;
  const withPhone = leads?.filter(l => l.phone).length || 0;
  const withWebsite = leads?.filter(l => l.website).length || 0;
  const highRated = leads?.filter(l => l.rating >= 4).length || 0;

  // ==========================================
  // LAST 7 DAYS DATA
  // ==========================================
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

  // ==========================================
  // RATING DISTRIBUTION
  // ==========================================
  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    name: `${r}★`,
    count: leads?.filter(l => Math.floor(l.rating || 0) === r).length || 0
  }));

  // ==========================================
  // PHONE AVAILABILITY
  // ==========================================
  const phoneData = [
    { name: 'With Phone', value: withPhone },
    { name: 'No Phone', value: totalLeads - withPhone }
  ];

  const COLORS = ['#7c3aed', '#e5e7eb'];
  const CHART_COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#ec4899', '#f59e0b'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Overview of your lead generation activities</p>

      {/* ==========================================
          STATS CARDS
          ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">{totalLeads}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">With Phone</p>
              <p className="text-2xl font-bold text-gray-800">{withPhone}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Phone className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">With Website</p>
              <p className="text-2xl font-bold text-gray-800">{withWebsite}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Globe className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">4+ Stars</p>
              <p className="text-2xl font-bold text-gray-800">{highRated}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <Star className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          LEADS LAST 7 DAYS
          ========================================== */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Leads (Last 7 Days)</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#7c3aed" 
                strokeWidth={2} 
                dot={{ fill: '#7c3aed' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ==========================================
          PHONE AVAILABILITY & RATING DISTRIBUTION
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Availability Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Phone Availability</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={phoneData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {phoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Rating Distribution Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Rating Distribution</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
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

      {/* ==========================================
          RECENT LEADS TABLE
          ========================================== */}
      <div className="bg-white rounded-xl shadow-sm p-5 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Recent Leads</h3>
          <span className="text-sm text-gray-400">{totalLeads} total leads</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading leads...</div>
        ) : leads?.length === 0 ? (
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
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 5).map((lead, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{lead.name || 'Unknown'}</td>
                    <td className="px-4 py-2 text-gray-600">{lead.email || '-'}</td>
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
