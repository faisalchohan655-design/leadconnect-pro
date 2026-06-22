import { useLeads } from '../../context/LeadsContext';

const CRMPipeline = () => {
  const { leads } = useLeads();

  const stages = ['Untouched', 'Contacted', 'Qualified', 'Negotiation', 'Closed Won'];

  const getStageColor = (stage) => {
    switch(stage) {
      case 'Untouched': return 'bg-gray-100 text-gray-700';
      case 'Contacted': return 'bg-blue-100 text-blue-700';
      case 'Qualified': return 'bg-purple-100 text-purple-700';
      case 'Negotiation': return 'bg-yellow-100 text-yellow-700';
      case 'Closed Won': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Use leads from LeadsContext
  const pipelineLeads = leads.slice(0, 10).map((lead, index) => ({
    id: lead._id || index,
    name: lead.name,
    company: lead.address || lead.website || 'N/A',
    stage: lead.status || stages[index % stages.length],
    value: `$${(Math.random() * 50000 + 5000).toFixed(0)}`,
    date: new Date(lead.createdAt).toLocaleDateString()
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        CRM Pipeline
      </h1>
      <p className="text-gray-500 mb-6">Track your deals from lead to close</p>

      {/* Stage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {stages.map((stage) => (
          <div key={stage} className="bg-white rounded-xl shadow-lg p-4 text-center">
            <h3 className="font-semibold text-gray-700">{stage}</h3>
            <p className="text-2xl font-bold text-purple-600">
              {pipelineLeads.filter(l => l.stage === stage).length}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Lead</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Stage</th>
                <th className="p-4 text-left">Value</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {pipelineLeads.map((lead) => (
                <tr key={lead.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{lead.name}</td>
                  <td className="p-4">{lead.company}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-4">{lead.value}</td>
                  <td className="p-4">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CRMPipeline;
