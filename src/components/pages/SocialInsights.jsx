// frontend/src/pages/SocialInsights.jsx
import { useState, useEffect } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner, FaGlobe, FaFilter, FaCheckCircle, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const SocialInsights = () => {
  const { addLeads } = useLeads();

  // ============================================
  // STATE
  // ============================================
  const [activePlatform, setActivePlatform] = useState('google_maps');
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
  const [qualityFilter, setQualityFilter] = useState('all');
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ LOCATION STATE
  const [selectedLocation, setSelectedLocation] = useState('New York, New York, United States');
  const [customLocation, setCustomLocation] = useState('');

  // ============================================
  // LOCATIONS DROPDOWN
  // ============================================
  const locations = [
    'New York, New York, United States',
    'Los Angeles, California, United States',
    'Chicago, Illinois, United States',
    'Houston, Texas, United States',
    'Phoenix, Arizona, United States',
    'Philadelphia, Pennsylvania, United States',
    'San Antonio, Texas, United States',
    'San Diego, California, United States',
    'Dallas, Texas, United States',
    'Austin, Texas, United States',
    'Miami, Florida, United States',
    'Seattle, Washington, United States',
    'Denver, Colorado, United States',
    'Washington DC, United States',
    'Boston, Massachusetts, United States',
    'London, England, United Kingdom',
    'Toronto, Ontario, Canada',
    'Sydney, New South Wales, Australia'
  ];

  // ============================================
  // PLATFORMS
  // ============================================
  const platforms = [
    { id: 'google_maps', name: 'Google Maps', icon: '📍', color: 'bg-green-600' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: '🔗', color: 'bg-blue-800' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-600' },
    { id: 'reddit', name: 'Reddit', icon: '🤖', color: 'bg-orange-600' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' }
  ];

  // ============================================
  // SEARCH FUNCTION - FIXED WITH LOCATION
  // ============================================
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a URL, keyword, or location');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Searching ${activePlatform} in ${selectedLocation}...`);

    try {
      const locationToUse = customLocation.trim() || selectedLocation;

      const response = await api.post('/social/search', {
        platform: activePlatform,
        searchType,
        query: query.trim(),
        count,
        deepCrawl,
        verifiedOnly,
        location: locationToUse,
        gl: 'us',
        hl: 'en'
      });

      const leads = response.data.results || [];
      
      // ✅ Auto-apply quality filter
      let filteredLeads = leads;
      if (verifiedOnly) {
        filteredLeads = leads.filter(l => l.verified === true);
      }

      setResults(filteredLeads);
      setSelected([]);
      setCurrentPage(1);
      
      toast.success(`Found ${filteredLeads.length} verified leads in ${locationToUse}`, { id: toastId });
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.error || 'Search failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SAVE ALL
  // ============================================
  const handleSaveAll = () => {
    if (filteredResults.length === 0) {
      toast.error('No leads to save');
      return;
    }
    setSaving(true);
    try {
      const leadsToSave = filteredResults.map(lead => ({
        name: lead.name || 'Unknown',
        email: lead.email || '',
        phone: lead.phone || '',
        address: lead.address || '',
        company: lead.company || '',
        website: lead.website || '',
        source: lead.platform || 'social',
        rating: lead.rating || 0,
        followers: lead.followers || 0,
        verified: lead.verified || false,
        status: 'new'
      }));
      
      addLeads(leadsToSave);
      toast.success(`Saved ${leadsToSave.length} leads to database`);
      setResults([]);
      setSelected([]);
    } catch (err) {
      toast.error('Failed to save leads');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE SELECTED
  // ============================================
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

  // ============================================
  // COPY URLs
  // ============================================
  const handleCopyUrls = () => {
    const selectedLeads = results.filter((_, idx) => selected.includes(idx));
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const urls = selectedLeads
      .map(l => l.website || l.sourceUrl || l.link)
      .filter(url => url && url.trim())
      .join('\n');
    
    if (!urls) {
      toast.error('No websites found');
      return;
    }
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${urls.split('\n').length} URLs to clipboard`);
  };

  // ============================================
  // COPY EMAILS
  // ============================================
  const handleCopyEmails = () => {
    const selectedLeads = results.filter((_, idx) => selected.includes(idx));
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const emails = selectedLeads
      .map(l => l.email)
      .filter(email => email && email.trim())
      .join('; ');
    
    if (!emails) {
      toast.error('No emails found');
      return;
    }
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${emails.split(';').length} emails to clipboard`);
  };

  // ============================================
  // EXPORT CSV
  // ============================================
  const exportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Name', 'Platform', 'Email', 'Phone', 'Website', 'Address', 'Followers', 'Rating', 'Verified'];
    const rows = filteredResults.map(l => [
      l.name || '',
      l.platform || '',
      l.email || '',
      l.phone || '',
      l.website || '',
      l.address || '',
      l.followers || 0,
      l.rating || 0,
      l.verified ? 'Yes' : 'No'
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

  // ============================================
  // EXPORT EXCEL
  // ============================================
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
      Address: l.address || '',
      Followers: l.followers || 0,
      Rating: l.rating || 0,
      Verified: l.verified ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SocialLeads');
    XLSX.writeFile(wb, `social_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // ============================================
  // FILTER RESULTS
  // ============================================
  const filteredResults = results.filter(l => {
    // Platform filter
    if (filterPlatform !== 'all' && l.platform !== filterPlatform) return false;
    
    // Quality filter
    if (qualityFilter === 'verified' && !l.verified) return false;
    if (qualityFilter === 'high' && (l.rating || 0) < 4.0) return false;
    if (qualityFilter === 'medium' && ((l.rating || 0) < 3.0 || (l.rating || 0) >= 4.0)) return false;
    if (qualityFilter === 'low' && (l.rating || 0) >= 3.0) return false;
    
    return true;
  });

  // ============================================
  // PAGINATION
  // ============================================
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // ============================================
  // SELECT ALL
  // ============================================
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

  // ============================================
  // GET PLATFORM COLOR
  // ============================================
  const getPlatformColor = (platformId) => {
    const p = platforms.find(p => p.id === platformId);
    return p ? p.color : 'bg-gray-500';
  };

  // ============================================
  // RENDER STARS
  // ============================================
  const renderStars = (rating) => {
    if (!rating || rating === 0) return '—';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={12} />);
    }
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" size={12} />);
    }
    return stars;
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        Social Insights
      </h1>
      <p className="text-gray-500 mb-6">Professional social media intelligence for lead generation</p>

      {/* ========================================== */}
      {/* PLATFORM TABS */}
      {/* ========================================== */}
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

      {/* ========================================== */}
      {/* SEARCH SECTION */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        {/* Search Type */}
        <div className="flex flex-wrap gap-4 mb-4">
          {['keyword', 'location', 'url'].map(type => (
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

        {/* Query Input */}
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

        {/* Options Row */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          {/* Leads Count */}
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

          {/* Deep Crawl */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={deepCrawl} 
              onChange={(e) => setDeepCrawl(e.target.checked)} 
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm">Deep Crawl</span>
          </label>

          {/* Verified Only */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={verifiedOnly} 
              onChange={(e) => setVerifiedOnly(e.target.checked)} 
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm">Verified Only</span>
          </label>
        </div>

        {/* ✅ LOCATION SELECTOR - NEW */}
        <div className="flex flex-wrap gap-3 items-center mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2">
            <FaGlobe className="text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Location:</span>
          </div>
          
          <select
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setCustomLocation('');
            }}
            className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 bg-white min-w-[200px]"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          
          <span className="text-gray-400 text-sm">OR</span>
          
          <input
            type="text"
            placeholder="Custom location (e.g., Dubai, UAE)"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 bg-white min-w-[150px]"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
        >
          {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={18} />}
          {loading ? 'Searching...' : 'Get Insights'}
        </button>
      </div>

      {/* ========================================== */}
      {/* RESULTS */}
      {/* ========================================== */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <label className="text-sm font-medium">Platform:</label>
              </div>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                <option value="all">All Platforms</option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 ml-4">
                <FaStar className="text-yellow-400" />
                <label className="text-sm font-medium">Quality:</label>
              </div>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="border rounded-lg p-2 text-sm"
              >
                <option value="all">All</option>
                <option value="verified">✅ Verified Only</option>
                <option value="high">⭐ High (4+)</option>
                <option value="medium">⭐ Medium (3-4)</option>
                <option value="low">⭐ Low (0-3)</option>
              </select>

              <span className="text-sm text-gray-500 ml-auto">
                {filteredResults.length} leads shown
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={toggleSelectAll}
                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-gray-700 transition"
              >
                {selected.length === currentLeads.length ? '☑️' : '☐'} Select All
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                💾 {saving ? 'Saving...' : 'Save All'}
              </button>
              <button
                onClick={handleCopyUrls}
                className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-cyan-700 transition"
              >
                📋 Copy URLs
              </button>
              <button
                onClick={handleCopyEmails}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-indigo-700 transition"
              >
                ✉️ Copy Emails
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-red-700 transition"
              >
                🗑️ Delete
              </button>
              <button
                onClick={exportCSV}
                className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-gray-700 transition"
              >
                📄 CSV
              </button>
              <button
                onClick={exportExcel}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-green-700 transition"
              >
                📊 Excel
              </button>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {selected.length} selected / {filteredResults.length} total
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-10">Select</th>
                  <th className="text-left p-3">Name</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Website</th>
                  <th className="p-3">Address</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Verified</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead, idx) => {
                  const globalIdx = indexOfFirst + idx;
                  return (
                    <tr key={globalIdx} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selected.includes(globalIdx)}
                          onChange={() => toggleSelect(idx)}
                          className="w-4 h-4 accent-purple-600"
                        />
                      </td>
                      <td className="p-3 font-medium text-gray-800">{lead.name || '-'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getPlatformColor(lead.platform)}`}>
                          {lead.platform || 'web'}
                        </span>
                      </td>
                      <td className="p-3">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="text-purple-600 hover:underline">
                            {lead.email}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="p-3">{lead.phone || '-'}</td>
                      <td className="p-3">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            Visit
                          </a>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-sm text-gray-600 max-w-[150px] truncate">
                        {lead.address || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {renderStars(lead.rating)}
                          <span className="text-xs text-gray-400 ml-1">
                            {lead.rating ? `(${lead.rating})` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        {lead.verified ? (
                          <FaCheckCircle className="text-green-500 text-lg mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {currentLeads.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center p-6 text-gray-500">
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
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
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

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600">No Results Yet</h3>
          <p className="text-gray-400 mt-2">
            Search for leads on {activePlatform} to get started
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Make sure to select a location for accurate results
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialInsights;
