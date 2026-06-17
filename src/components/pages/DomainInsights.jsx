import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const DomainInsights = () => {
  const { addLeads } = useLeads();

  // State
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [deep, setDeep] = useState(false);
  const [maxPages, setMaxPages] = useState(5);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterDomain, setFilterDomain] = useState('');

  // --- Extract ---
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
          maxPagesPerUrl: maxPages
        });
      } else {
        response = await api.post('/email/extract', {
          url: singleUrl,
          deep,
          maxPages
        });
      }

      const leads = response.data.leads || [];
      setResults(leads);
      setSelected([]);
      toast.success(`Found ${leads.length} emails`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Extraction failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // --- Save selected to LeadsContext ---
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

  // --- Delete selected ---
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

  // --- Export CSV ---
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

  // --- Export Excel ---
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

  // --- Filter results ---
  const filteredResults = results.filter(e => {
    if (filterVerified && !e.verified) return false;
    if (filterDomain && !e.email.endsWith('@' + filterDomain)) return false;
    return true;
  });

  // --- Pagination ---
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredResults.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // --- Select All / Toggle ---
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

  return (
    <div>
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
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bulk URLs (one per line)</label>
            <textarea
              rows="3"
              placeholder="https://site1.com\nhttps://site2.com"
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={deep} onChange={(e) => setDeep(e.target.checked)} className="w-4 h-4" />
            Deep crawl (max {maxPages} pages)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value))}
            className="border rounded p-1 w-20"
          />
          <button
            onClick={handleExtract}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSearch size={16} />}
            {loading ? 'Extracting...' : 'Extract Emails & Phones'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={filterVerified} onChange={(e) => setFilterVerified(e.target.checked)} className="w-4 h-4" />
              Verified only
            </label>
            <input
              type="text"
              placeholder="Filter by domain (e.g., gmail.com)"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
              className="border rounded-lg p-2 text-sm flex-1 min-w-[200px]"
            />
            <span className="text-sm text-gray-500">{filteredResults.length} shown / {results.length} total</span>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <button onClick={toggleSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
                {selected.length === currentLeads.length ? '☑️' : '☐'} Select All
              </button>
              <button onClick={handleSaveSelected} disabled={saving} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
                <span className="text-lg">💾</span> {saving ? 'Saving...' : 'Save Selected'}
              </button>
              <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
                <span className="text-lg">🗑️</span> Delete
              </button>
              <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
                <span className="text-lg">📄</span> CSV
              </button>
              <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
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
                  <th className="text-left">Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Verified</th>
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
                      <td className="p-3 font-medium break-all">{lead.email}</td>
                      <td className="p-3">{lead.phone || '-'}</td>
                      <td className="p-3 max-w-xs truncate">{lead.source}</td>
                      <td className="p-3">{lead.verified ? '✅ Yes' : '❌ No'}</td>
                    </tr>
                  );
                })}
                {currentLeads.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
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

export default DomainInsights;
