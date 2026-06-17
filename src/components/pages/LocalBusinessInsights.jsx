import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import ActionBar from '../common/ActionBar';
import FilterBar from '../common/FilterBar';
import Table from '../common/Table';

const LocalBusinessInsights = () => {
  const { addLeads } = useLeads();
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(10);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ minRating: 0, city: '', search: '', source: 'all' });

  const handleSearch = async () => {
    if (!keyword.trim() || !city.trim()) return toast.error('Enter keyword and city');
    setLoading(true);
    const toastId = toast.loading('Fetching...');
    try {
      const res = await api.post('/scrape', {
        keyword, city, count,
        filters: { requireEmail, requirePhone, requireWebsite }
      });
      setResults(res.data.leads || []);
      setSelected([]);
      toast.success(`Found ${res.data.leads?.length || 0} businesses`, { id: toastId });
    } catch (err) {
      toast.error('Failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const saveAll = () => {
    if (!results.length) return toast.error('No leads to save');
    addLeads(results);
    toast.success(`Saved ${results.length} leads`);
    setResults([]);
  };

  // Other actions (delete, export, etc.) would be implemented similarly using the shared context
  // For brevity, we show the structure; in real code, we'd implement all actions.

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Local Business Insights</h1>
      {/* Search Form – same as before */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Keyword" value={keyword} onChange={e => setKeyword(e.target.value)} className="border rounded-xl p-2" required />
            <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="border rounded-xl p-2" required />
          </div>
          <input type="number" min="1" max="50" value={count} onChange={e => setCount(parseInt(e.target.value))} className="border rounded-xl p-2 w-32" />
          <div className="flex gap-4">
            <label><input type="checkbox" checked={requireEmail} onChange={() => setRequireEmail(!requireEmail)} /> Must have Email</label>
            <label><input type="checkbox" checked={requirePhone} onChange={() => setRequirePhone(!requirePhone)} /> Must have Phone</label>
            <label><input type="checkbox" checked={requireWebsite} onChange={() => setRequireWebsite(!requireWebsite)} /> Must have Website</label>
          </div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Search</button>
        </form>
      </div>
      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))} showSource={false} />
      {/* Action Bar */}
      <ActionBar
        selectedCount={selected.length}
        totalCount={results.length}
        onSelectAll={() => setSelected(selected.length === results.length ? [] : results.map((_, i) => i))}
        onSave={saveAll}
        onCopyUrls={() => {}}
        onWhatsApp={() => {}}
        onEmail={() => {}}
        onDelete={() => {}}
        onExportCSV={() => {}}
        onExportExcel={() => {}}
        disabled={!results.length}
      />
      {/* Table */}
      <Table
        leads={results}
        selected={selected}
        onToggleSelect={(idx) => setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])}
        onToggleSelectAll={() => setSelected(selected.length === results.length ? [] : results.map((_, i) => i))}
        onAction={(action, id) => {}}
      />
    </div>
  );
};
export default LocalBusinessInsights;
