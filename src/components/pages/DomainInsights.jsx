// frontend/src/components/pages/DomainInsights.jsx
import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext.jsx';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const DomainInsights = () => {
  const { addLeads } = useLeads();

  // State
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [maxPages, setMaxPages] = useState(5);
  const [extractSocial, setExtractSocial] = useState(true);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================
  // EXTRACT FUNCTION
  // ==========================================
  const handleExtract = async () => {
    if (!singleUrl && !bulkUrls) {
      toast.error('Enter URL(s)');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Extracting emails & phones...');

    try {
      let response;
      if (bulkUrls) {
        const urls = bulkUrls.split('\n').filter(u => u.trim());
        if (urls.length === 0) throw new Error('No valid URLs');
        response = await api.post('/email/bulk-extract', {
          urls,
          deep,
          maxPagesPerUrl: maxPages,
          extractSocial
        });
      } else {
        response = await api.post('/email/extract', {
          url: singleUrl,
          deep,
          maxPages,
          extractSocial
        });
      }

      const leads = response.data.leads || [];
      const validLeads = leads.filter(lead => {
        return lead.email && 
          lead.email.includes('@') && 
          !lead.email.includes('test') &&
          !lead.email.includes('example');
      });

      setResults(validLeads);
      setSelected([]);
      toast.success(`Found ${validLeads.length} emails`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ SAVE SELECTED - FIXED WITH AWAIT
  // ==========================================
  const handleSaveSelected = async () => {
    if (selected.length === 0) {
      toast.error('No leads selected');
      return;
    }

    const leadsToSave = results.filter((_, idx) => selected.includes(idx));
    
    const formatted = leadsToSave.map(lead => ({
      name: lead.name || lead.email?.split('@')[0] || 'Unknown',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      company: lead.company || '',
      website: lead.website || lead.source || '',
      source: lead.source || 'domain',
      platform: lead.platform || 'web',
      rating: lead.rating || 0,
      verified: lead.verified || false,
      status: 'new'
    }));

    setSaving(true);
    const toastId = toast.loading(`Saving ${formatted.length} leads...`);

    try {
      // ⚠️ IMPORTANT: AWAIT LAGANA HAI
      await addLeads(formatted);
      
      setResults(results.filter((_, idx) => !selected.includes(idx)));
      setSelected([]);
      toast.success(`✅ ${formatted.length} leads saved!`, { id: toastId });
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE SELECTED
  // ==========================================
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

  // ==========================================
  // EXPORT CSV
  // ==========================================
  const exportCSV = () => {
    if (filteredResults.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Email', 'Phone', 'Source', 'Verified'];
    const rows = filteredResults.map(e => [e.email, e.phone || '', e.source, e.verified ? 'Yes' : 'No']);
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

  // ==========================================
  // EXPORT EXCEL
  // ==========================================
  const exportExcel = () => {
    if (filteredResults.length === 0) {
      toast.error('No data');
      return;
    }
    const data = filteredResults.map(e => ({
      Email: e.email,
      Phone: e.phone || '',
      Source: e.source,
      Verified: e.verified ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DomainInsights');
    XLSX.writeFile(wb, `domain_insights_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // ==========================================
  // FILTERS & PAGINATION
  // ==========================================
  const filteredResults = results.filter(e => {
    if (filterVerified && !e.verified) return false;
    if (filterDomain && !e.email.endsWith('@' + filterDomain)) return false;
    if (filterSource === 'website' && e.sourceType !== 'website') return false;
    if (filterSource === 'social' && e.sourceType !== 'social') return false;
    return true;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

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

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Domain Insights
      </h1>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Single URL</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bulk URLs (one per line)</label>
            <textarea
              rows="3"
              placeholder="https://site1.com\nhttps://site2.com"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="w-4 h-4" />
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
          
          <label className="flex items-center gap-2 cursor-pointer ml-4">
            <input type="checkbox" checked={extractSocial} onChange={(e) => setExtractSocial(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Extract from Social Links</span>
          </label>

          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg disabled:opacity-50 transition ml-auto"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={16} />}
            {loading ? 'Extracting...' : 'Extract'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={filterVerified} onChange={(e) => setFilterVerified(e.target.checked)} className="w-4 h-4" />
              Verified only
            </label>
            <input
              type="text"
              placeholder="Filter by domain (e.g., gmail.com)"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm flex-1 min-w-[200px]"
            />
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="website">Website Only</option>
              <option value="social">Social Only</option>
            </select>
            <span className="text-sm text-gray-500 ml-auto">
              {filteredResults.length} shown / {results.length} total
            </span>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={toggleSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-gray-700">
                {selected.length === currentLeads.length ? '☑️' : '☐'} Select All
              </button>
              
              <button onClick={handleSaveSelected} disabled={saving || selected.length === 0} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-purple-700 disabled:opacity-50">
                💾 {saving ? 'Saving...' : `Save Selected (${selected.length})`}
              </button>
              
              <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-red-700">
                🗑️ Delete
              </button>
              <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-gray-700">
                📄 CSV
              </button>
              <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-green-700">
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
                  <th className="p-3">Verified</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead, idx) => {
                  const globalIdx = indexOfFirst + idx;
                  return (
                    <tr key={globalIdx} className="border-t hover:bg-gray-50">
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
                      <td className="p-3 max-w-xs truncate text-gray-600">{lead.source || '-'}</td>
                      <td className="p-3 text-center">
                        {lead.verified ? (
                          <span className="text-green-500">✅</span>
                        ) : (
                          <span className="text-gray-300">❌</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
              >
                ◀ Prev
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
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
          <p className="text-gray-400 mt-2">Enter a URL to extract emails</p>
        </div>
      )}
    </div>
  );
};

export default DomainInsights;
