import { useLeads } from '../context/LeadsContext';

const Dashboard = () => {
  const { leads, loading } = useLeads();

  if (loading) return <div>Loading leads...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Total Leads: {leads.length}</p>
      {/* Charts and stats will be added here */}
    </div>
  );
};
export default Dashboard;
