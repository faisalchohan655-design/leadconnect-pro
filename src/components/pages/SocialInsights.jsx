import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const SocialInsights = () => {
  const { addLeads } = useLeads();

  // State
  const [activePlatform, setActivePlatform] = useState('facebook');
  const [searchType, setSearchType] = useState('keyword');
  const [query, setQuery] = useState('');
  const [count, setCount] = useState(10);
  const [deepCrawl, setDeepCrawl] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: '🔗', color: 'bg-blue-800' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'reddit', name: 'Reddit', icon: '🤖', color: 'bg-orange-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' }
  ];

  // --- Search ---
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a URL, keyword, or location');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Searching ${activePlatform}...`);

    try {
      const response = await api.post('/social/search', {
        platform: activePlatform,
        searchType,
        query: query.trim(),
        count,
        deepCrawl,
        verifiedOnly
      });

      const leads = response.data.results || [];
      setResults(leads);
      setSelected([]);
      setCurrentPage(1);
      toast.success(`Found ${leads.length} leads on ${activePlatform}`, { id: toastId });
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.error || 'Search failed', { id: toastId });
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
    const urls = selectedLeads.map(l => l.website || l.sourceUrl).filter(url => url && url.trim()).join('\n');
    if (!urls) {
      toast.error('No websites found');
      return;
    }
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${urls.split('\n').length} URLs to clipboard`);
  };

  // --- Export CSV ---
  const exportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Name', 'Platform', 'Email', 'Phone', 'Website', 'Followers', 'Rating'];
    const rows = filteredResults.map(l => [
      l.name || '',
      l.platform || '',
      l.email || '',
      l.phone || '',
      l.website || '',
      l.followers || 0,
      l.rating || 0
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // --- Export Excel ---
  const exportExcel = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const data = filteredResults.map(l => ({
      Name: l.name || '',
      Platform: l.platform || '',
      Email: l.email || '',
      Phone: l.phone || '',
      Website: l.website || '',
      Followers: l.followers || 0,
      Rating: l.rating || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SocialLeads');
    XLSX.writeFile(wb, `social_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // --- Filter results ---
  const filteredResults = results.filter(l => {
    if (filterPlatform !== 'all' && l.platform !== filterPlatform) return false;
    return true;
  });

  // --- Pagination ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

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

  // --- Get platform color ---
  const getPlatformColor = (platformId) => {
    const p = platforms.find(p => p.id === platformId);
    return p ? p.color : 'bg-gray-500';
  };

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Social Insights
      </h1>
      <p className="text-gray-500 mb-6">Professional social media intelligence for lead generation</p>

      {/* Platform Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => setActivePlatform(platform.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
              activePlatform === platform.id
                ? `${platform.color} text-white shadow-lg scale-105`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg">{platform.icon}</span>
            <span className="font-medium">{platform.name}</span>
          </button>
        ))}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 mb-4">
          {['url', 'keyword', 'location'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="searchType"
                value={type}
                checked={searchType === type}
                onChange={() => setSearchType(type)}
                className="w-4 h-4 accent-purple-600"
              />
              <span className="text-sm font-medium capitalize">{type}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Enter ${activePlatform} ${searchType}...`}
            className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Leads:</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="border rounded-lg p-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={deepCrawl} onChange={(e) => setDeepCrawl(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Deep Crawl (Multiple Pages)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Verified Email Only</span>
          </label>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={18} />}
          {loading ? 'Searching...' : 'Get Insights'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex flex-wrap gap-4 items-center">
              <label className="text-sm font-medium">Platform Filter:</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="text-sm text-gray-500 ml-auto">{filteredResults.length} leads shown</span>
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
              {selected.length} selected / {filteredResults.length} total
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Select</th>
                  <th className="text-left">Name</th>
                  <th>Platform</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Website</th>
                  <th>Followers</th>
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
                      <td className="p-3 font-medium">{lead.name || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getPlatformColor(lead.platform)}`}>
                          {lead.platform || 'web'}
                        </span>
                      </td>
                      <td className="p-3">{lead.email || '-'}</td>
                      <td className="p-3">{lead.phone || '-'}</td>
                      <td className="p-3">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" className="text-purple-600 hover:underline">
                            Visit
                          </a>
                        ) : '-'}
                      </td>
                      <td className="p-3">{lead.followers?.toLocaleString() || '-'}</td>
                      <td className="p-3">{lead.rating ? `${lead.rating}★` : '-'}</td>
                    </tr>
                  );
                })}
                {currentLeads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center p-6 text-gray-500">
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

export default SocialInsights;
