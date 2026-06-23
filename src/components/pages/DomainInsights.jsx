// frontend/src/pages/DomainInsights.jsx
import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner, FaLink, FaFacebook, FaLinkedin, FaInstagram, FaTwitter, FaGithub } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const DomainInsights = () => {
  const { addLeads } = useLeads();

  // State
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [maxPages, setMaxPages] = useState(5);
  const [extractSocial, setExtractSocial] = useState(true); // ✅ NEW
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterSource, setFilterSource] = useState('all'); // ✅ NEW
  const [showSocialDetails, setShowSocialDetails] = useState(false); // ✅ NEW

  // ============================================
  // ✅ SOCIAL PLATFORMS
  // ============================================
  const socialPlatforms = [
    { id: 'facebook', name: 'Facebook', icon: <FaFacebook className="text-blue-600" /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin className="text-blue-800" /> },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram className="text-pink-600" /> },
    { id: 'twitter', name: 'Twitter', icon: <FaTwitter className="text-blue-400" /> },
    { id: 'github', name: 'GitHub', icon: <FaGithub className="text-gray-700" /> }
  ];

  // ============================================
  // ✅ EXTRACT FUNCTION - UPDATED
  // ============================================
  const handleExtract = async () => {
    if (!singleUrl && !bulkUrls) {
      toast.error('Enter URL(s)');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Extracting emails & phones from websites and social links...');

    try {
      let response;
      if (bulkUrls) {
        const urls = bulkUrls.split('\n').filter(u => u.trim());
        if (urls.length === 0) throw new Error('No valid URLs');
        response = await api.post('/email/bulk-extract', {
          urls,
          deep,
          maxPagesPerUrl: maxPages,
          extractSocial: extractSocial // ✅ NEW
        });
      } else {
        response = await api.post('/email/extract', {
          url: singleUrl,
          deep,
          maxPages,
          extractSocial: extractSocial // ✅ NEW
        });
      }

      const leads = response.data.leads || [];
      
      // ✅ FILTER FAKE/INVALID EMAILS
      const validLeads = leads.filter(lead => {
        const hasValidEmail = lead.email && 
          lead.email.includes('@') && 
          !lead.email.includes('test') &&
          !lead.email.includes('example') &&
          !lead.email.includes('fake') &&
          !lead.email.includes('noreply') &&
          !lead.email.includes('admin') &&
          !lead.email.includes('support') &&
          lead.email.length > 5;
        
        return hasValidEmail;
      });

      // ✅ Add source type to each lead
      const leadsWithSource = validLeads.map(lead => ({
        ...lead,
        sourceType: lead.socialSource || 'website'
      }));

      setResults(leadsWithSource);
      setSelected([]);
      
      const socialCount = leadsWithSource.filter(l => l.sourceType === 'social').length;
      const websiteCount = leadsWithSource.filter(l => l.sourceType === 'website').length;
      
      toast.success(
        `Found ${leadsWithSource.length} emails (${websiteCount} from websites, ${socialCount} from social links)`,
        { id: toastId }
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✅ SAVE SELECTED
  // ============================================
  const handleSaveSelected = () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const leadsToSave = results.filter((_, idx) => selected.includes(idx));
    setSaving(true);
    try {
      addLeads(leadsToSave);
      toast.success(`Saved ${leadsToSave.length} leads to database`);
      setResults(results.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
    } catch (err) {
      toast.error('Failed to save leads');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ✅ DELETE SELECTED
  // ============================================
  const handleDeleteSelected = () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const newResults = results.filter((_, idx) => !selected.includes(idx));
    setResults(newResults);
    setSelected([]);
    toast.success(`${selected.length} leads removed`);
  };

  // ============================================
  // ✅ COPY SOCIAL LINKS
  // ============================================
  const handleCopySocialLinks = () => {
    const selectedLeads = results.filter((_, idx) => selected.includes(idx));
    if (selectedLeads.length === 0) {
      toast.error('No leads selected');
      return;
    }
    const socialLinks = selectedLeads
      .filter(l => l.socialLinks && l.socialLinks.length > 0)
      .flatMap(l => l.socialLinks)
      .filter(link => link)
      .join('\n');
    
    if (!socialLinks) {
      toast.error('No social links found');
      return;
    }
    navigator.clipboard.writeText(socialLinks);
    toast.success(`Copied ${socialLinks.split('\n').length} social links to clipboard`);
  };

  // ============================================
  // ✅ EXPORT CSV
  // ============================================
  const exportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Email', 'Phone', 'Source', 'Source Type', 'Verified', 'Social Links'];
    const rows = filteredResults.map(e => [
      e.email,
      e.phone || '',
      e.source || '',
      e.sourceType || 'website',
      e.verified ? 'Yes' : 'No',
      e.socialLinks ? e.socialLinks.join('; ') : ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain_insights_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  // ============================================
  // ✅ EXPORT EXCEL
  // ============================================
  const exportExcel = () => {
    if (filteredResults.length === 0) {
      toast.error('No data');
      return;
    }
    const data = filteredResults.map(e => ({
      Email: e.email,
      Phone: e.phone || '',
      Source: e.source || '',
      'Source Type': e.sourceType || 'website',
      Verified: e.verified ? 'Yes' : 'No',
      'Social Links': e.socialLinks ? e.socialLinks.join('; ') : ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DomainInsights');
    XLSX.writeFile(wb, `domain_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // ============================================
  // ✅ FILTER RESULTS
  // ============================================
  const filteredResults = results.filter(e => {
    if (filterVerified && !e.verified) return false;
    if (filterDomain && !e.email.endsWith('@' + filterDomain)) return false;
    if (filterSource === 'website' && e.sourceType !== 'website') return false;
    if (filterSource === 'social' && e.sourceType !== 'social') return false;
    return true;
  });

  // ============================================
  // ✅ PAGINATION
  // ============================================
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // ============================================
  // ✅ SELECT ALL / TOGGLE
  // ============================================
  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) setSelected([]);
    else setSelected(currentLeads.map((_, idx) => indexOfFirst + idx));
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
  // ✅ GET SOURCE BADGE
  // ============================================
  const getSourceBadge = (sourceType) => {
    if (sourceType === 'social') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">📱 Social</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">🌐 Website</span>;
  };

  // ============================================
  // ✅ RENDER SOCIAL LINKS
  // ============================================
  const renderSocialLinks = (links) => {
    if (!links || links.length === 0) return '-';
    return links.map((link, i) => (
      <a 
        key={i}
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-purple-600 hover:underline text-xs block truncate max-w-[150px]"
      >
        {link}
      </a>
    ));
  };

  // ============================================
  // ✅ STATS
  // ============================================
  const stats = {
    total: results.length,
    website: results.filter(r => r.sourceType === 'website').length,
    social: results.filter(r => r.sourceType === 'social').length,
    verified: results.filter(r => r.verified).length
  };

  // ============================================
  // ✅ RENDER
  // ============================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Domain Insights
      </h1>
      <p className="text-gray-500 mb-6">Extract emails and phone numbers from websites and social media links</p>

      {/* ========================================== */}
      {/* INPUT SECTION */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Single URL</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bulk URLs (one per line)</label>
            <textarea
              rows="3"
              placeholder="https://site1.com\nhttps://site2.com"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* ✅ OPTIONS ROW - UPDATED */}
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={deep} 
              onChange={(e) => setDeep(e.target.checked)} 
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm">Deep crawl (max {maxPages} pages)</span>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value) || 5)}
            className="border border-gray-300 rounded-lg p-1 w-20"
          />
          
          {/* ✅ NEW: Extract Social Links Toggle */}
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input 
              type="checkbox" 
              checked={extractSocial} 
              onChange={(e) => setExtractSocial(e.target.checked)} 
              className="w-4 h-4 accent-purple-600"
            />
            <span className="text-sm flex items-center gap-1">
              <FaLink className="text-purple-600" />
              Extract from Social Links
            </span>
          </label>

          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition ml-auto"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={16} />}
            {loading ? 'Extracting...' : 'Extract Emails & Phones'}
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* STATS CARDS */}
      {/* ========================================== */}
      {results.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">🌐 Website</p>
            <p className="text-xl font-bold text-blue-600">{stats.website}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">📱 Social</p>
            <p className="text-xl font-bold text-purple-600">{stats.social}</p>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-xs text-gray-500">✅ Verified</p>
            <p className="text-xl font-bold text-green-600">{stats.verified}</p>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* RESULTS */}
      {/* ========================================== */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={filterVerified} 
                onChange={(e) => setFilterVerified(e.target.checked)} 
                className="w-4 h-4 accent-purple-600"
              />
              Verified only
            </label>
            
            <input
              type="text"
              placeholder="Filter by domain (e.g., gmail.com)"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            {/* ✅ NEW: Source Filter */}
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="website">🌐 Website Only</option>
              <option value="social">📱 Social Only</option>
            </select>

            <span className="text-sm text-gray-500 ml-auto">
              {filteredResults.length} shown / {results.length} total
            </span>
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
                onClick={handleSaveSelected} 
                disabled={saving} 
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-purple-700 transition disabled:opacity-50"
              >
                💾 {saving ? 'Saving...' : 'Save Selected'}
              </button>
              <button 
                onClick={handleDeleteSelected} 
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-red-700 transition"
              >
                🗑️ Delete
              </button>
              
              {/* ✅ NEW: Copy Social Links Button */}
              <button 
                onClick={handleCopySocialLinks} 
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-purple-700 transition"
              >
                🔗 Copy Social Links
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
                  <th className="text-left p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Source Type</th>
                  <th className="p-3">Social Links</th>
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
                      <td className="p-3 font-medium break-all text-gray-800">{lead.email}</td>
                      <td className="p-3">{lead.phone || '-'}</td>
                      <td className="p-3 max-w-xs truncate text-gray-600">
                        {lead.source || lead.website || '-'}
                      </td>
                      <td className="p-3">
                        {getSourceBadge(lead.sourceType)}
                      </td>
                      <td className="p-3 max-w-[200px]">
                        {renderSocialLinks(lead.socialLinks)}
                      </td>
                      <td className="p-3 text-center">
                        {lead.verified ? (
                          <span className="text-green-500 text-lg">✅</span>
                        ) : (
                          <span className="text-gray-300">❌</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {currentLeads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center p-6 text-gray-500">
                      No leads match filters
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
              <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
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
            Enter a URL and click Extract to get emails and phone numbers
          </p>
          <p className="text-sm text-gray-300 mt-1">
            Enable "Extract from Social Links" to get emails from social media profiles
          </p>
        </div>
      )}
    </div>
  );
};

export default DomainInsights;
