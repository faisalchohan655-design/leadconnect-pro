// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useLeads } from '../context/LeadsContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserPlus, TrendingUp, Award, Mail, Phone, Globe, Star } from 'lucide-react';

const Dashboard = () => {
  const { leads, fetchLeads, loading } = useLeads();
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0
  });

  // ✅ FORCE FETCH ON MOUNT
  useEffect(() => {
    console.log('🔄 Dashboard mounting - fetching leads...');
    fetchLeads();
  }, []);

  // ✅ REFRESH EVERY 10 SECONDS
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh dashboard...');
      fetchLeads();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Update stats when leads change
  useEffect(() => {
    if (leads && leads.length > 0) {
      console.log('📊 Dashboard: Updating stats for', leads.length, 'leads');
      
      const newLeads = leads.filter(l => l.status === 'new' || !l.status);
      const contacted = leads.filter(l => l.status === 'contacted');
      const qualified = leads.filter(l => l.status === 'qualified');
      const converted = leads.filter(l => l.status === 'converted' || l.status === 'closed');
      
      setStats({
        total: leads.length,
        new: newLeads.length,
        contacted: contacted.length,
        qualified: qualified.length,
        converted: converted.length
      });
    } else {
      setStats({
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0
      });
    }
  }, [leads]);

  // Chart data
  const chartData = [
    { name: 'New', value: stats.new },
    { name: 'Contacted', value: stats.contacted },
    { name: 'Qualified', value: stats.qualified },
    { name: 'Converted', value: stats.converted }
  ];

  const COLORS = ['#7c3aed', '#3b82f6', '#22c55e', '#ec4899'];

  // Stat cards
  const statCards = [
    { 
      title: 'Total Leads', 
      value: stats.total, 
      icon: <Users className="text-purple-500" size={24} />,
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'New Leads', 
      value: stats.new, 
      icon: <UserPlus className="text-blue-500" size={24} />,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Qualified', 
      value: stats.qualified, 
      icon: <Award className="text-green-500" size={24} />,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Converted', 
      value: stats.converted, 
      icon: <TrendingUp className="text-pink-500" size={24} />,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  // Recent leads (last 5)
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Dashboard
      </h1>
      <p className="text-gray-500 mb-6">Overview of your lead generation activities</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Lead Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Lead Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Recent Leads</h3>
          <span className="text-sm text-gray-400">{leads.length} total leads</span>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading leads...</div>
        ) : recentLeads.length === 0 ? (
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
                {recentLeads.map((lead, index) => (
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
