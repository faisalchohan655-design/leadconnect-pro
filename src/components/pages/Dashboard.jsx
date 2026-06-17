import { useLeads } from '../../context/LeadsContext';

const Dashboard = () => {
  const { leads, loading } = useLeads();

  if (loading) return <div className="p-6 text-center">Loading leads...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Dashboard</h1>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <p className="text-gray-600">Total Leads: <span className="font-bold text-2xl">{leads.length}</span></p>
      </div>
    </div>
  );
};
export default Dashboard;
