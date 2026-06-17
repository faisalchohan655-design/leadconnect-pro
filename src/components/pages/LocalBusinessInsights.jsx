import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const LocalBusinessInsights = () => {
  const { addLeads } = useLeads();

  // Form state
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [count, setCount] = useState(10);
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireWebsite, setRequireWebsite] = useState(false);

  // Results state
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    minRating: 0,
    cityFilter: '',
    search: ''
  });

  // Pagination
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Search ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim() || !city.trim()) {
      toast.error('Enter keyword and city');
      return;
    }
    if (count < 1 || count > 50) {
      toast.error('Count must be 1–50');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Fetching business insights...');

    try {
      const res = await api.post('/scrape', {
        keyword: keyword.trim(),
        city: city.trim(),
        count,
        filters: { requireEmail, requirePhone, requireWebsite }
      });

      const leads = res.data.leads || [];
      setResults(leads);
      setSelected([]);
      setCurrentPage(1);
      toast.success(`Found ${leads.length} businesses`, { id: toastId });
    } catch (err) {
      console.error('Search error:', err);
      toast.error(err.response?.data?.error || 'Search failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- Save all results to LeadsContext ---
  const handleSaveAll = () => {
    if (results.length === 0) {
      toast.error('No leads to save');
      return;
    }
    setSaving(true);
    try {
      addLeads(results);
      toast.success(`Saved ${results.length} leads to database`);
      setResults([]);
      setSelected([]);
    } catch (err) {
      toast.error('Failed to save leads');
    } finally {
      setSaving(false);
    }
  };

  // --- Delete selected (from results only) ---
  const handleDeleteSelected = () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const newResults = results.filter((_, idx) => !selected.includes(idx));
    setResults(newResults);
    setSelected([]);
    toast.success(`${selected.length} leads removed from results`);
  };

  // --- Copy Selected URLs ---
  const handleCopyUrls = () => {
    const selectedLeads = results.filter((_, idx) => selected.includes(idx));
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const urls = selectedLeads.map(l => l.website).filter(url => url && url.trim()).join('\n');
    if (!urls) {
      toast.error('No websites found');
      return;
    }
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${urls.split('\n').length} URLs to clipboard`);
  };

  // --- Export CSV ---
  const exportCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Name', 'Phone', 'Email', 'Website', 'Address', 'Rating'];
    const rows = filteredLeads.map(l => [l.name, l.phone || '', l.email || '', l.website || '', l.address || '', l.rating || '']);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business_insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // --- Export Excel ---
  const exportExcel = () => {
    if (filteredLeads.length === 0) {
      toast.error('No data to export');
      return;
    }
    const data = filteredLeads.map(l => ({
      Name: l.name,
      Phone: l.phone || '',
      Email: l.email || '',
      Website: l.website || '',
      Address: l.address || '',
      Rating: l.rating || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BusinessLeads');
    XLSX.writeFile(wb, `business_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // --- Filter results ---
  const filteredLeads = results.filter(lead => {
    if (filters.minRating > 0 && (lead.rating || 0) < filters.minRating) return false;
    if (filters.cityFilter && !(lead.address || '').toLowerCase().includes(filters.cityFilter.toLowerCase())) return false;
    if (filters.search && !lead.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // --- Pagination ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // --- Select All / Toggle ---
  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) {
      setSelected([]);
    } else {
      setSelected(currentLeads.map((_, idx) => indexOfFirst + idx));
    }
  };

  const toggleSelect = (idx) => {
    const globalIdx = indexOfFirst + idx;
    if (selected.includes(globalIdx)) {
      setSelected(selected.filter(i => i !== globalIdx));
    } else {
      setSelected([...selected, globalIdx]);
    }
  };

  // --- Render ---
  return (
    <div>
      {/* ✅ Purple/Pink header gradient */}
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Local Business Insights
      </h1>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Type / Keyword</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., restaurants, plumbers"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Karachi, Lahore"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Results (max 50)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Quality Filters */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Quality Filters (Optional)</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requireEmail} onChange={() => setRequireEmail(!requireEmail)} className="w-4 h-4" />
                Must have Email
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requirePhone} onChange={() => setRequirePhone(!requirePhone)} className="w-4 h-4" />
                Must have Phone
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requireWebsite} onChange={() => setRequireWebsite(!requireWebsite)} className="w-4 h-4" />
                Must have Website
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">Enable to save only leads with selected contact information.</p>
          </div>

          {/* ✅ Purple/Pink button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            {loading ? 'Fetching...' : 'Get Insights'}
          </button>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500">Min Rating</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-32"
                />
                <span className="ml-2 text-sm">{filters.minRating}★</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">City (in address)</label>
                <input
                  type="text"
                  placeholder="e.g., Karachi"
                  value={filters.cityFilter}
                  onChange={(e) => setFilters({ ...filters, cityFilter: e.target.value })}
                  className="border rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Search by name</label>
                <input
                  type="text"
                  placeholder="Business name"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="border rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                {selected.length === currentLeads.length ? '☑️' : '☐'} Select All
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                <span className="text-lg">💾</span> {saving ? 'Saving...' : 'Save All'}
              </button>
              <button
                onClick={handleCopyUrls}
                className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                <span className="text-lg">📋</span> Copy URLs
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                <span className="text-lg">🗑️</span> Delete
              </button>
              <button
                onClick={exportCSV}
                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                <span className="text-lg">📄</span> CSV
              </button>
              <button
                onClick={exportExcel}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
              >
                <span className="text-lg">📊</span> Excel
              </button>
            </div>
            <div className="text-sm font-medium">
              {selected.length} selected / {filteredLeads.length} total
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Select</th>
                  <th className="text-left">Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Website</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead, idx) => {
                  const globalIdx = indexOfFirst + idx;
                  return (
                    <tr key={globalIdx} className="border-t hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(globalIdx)}
                          onChange={() => toggleSelect(idx)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-3 font-medium">{lead.name}</td>
                      <td className="p-3">{lead.phone || '-'}</td>
                      <td className="p-3">{lead.email || '-'}</td>
                      <td className="p-3">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" className="text-purple-600 hover:underline">
                            Visit
                          </a>
                        ) : '-'}
                      </td>
                      <td className="p-3 max-w-xs truncate">{lead.address || '-'}</td>
                      <td className="p-3">{lead.rating || '-'}</td>
                    </tr>
                  );
                })}
                {currentLeads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      No leads match the current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                ◀ Prev
              </button>
              <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
              >
                Next ▶
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LocalBusinessInsights;
