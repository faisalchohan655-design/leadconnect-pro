import { useEffect, useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const WebsiteIntelligence = () => {
  const { leads, fetchLeads } = useLeads();
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minRating: 0
  });

  useEffect(() => {
    fetchLeads();
    setLoading(false);
  }, []);

  useEffect(() => {
    let r = leads.filter(l => l.website && l.website.trim());
    if (filters.search) r = r.filter(l => l.name.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.city) r = r.filter(l => l.address?.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.minRating > 0) r = r.filter(l => (l.rating || 0) >= filters.minRating);
    setFiltered(r);
    setSelectedIds([]);
  }, [filters, leads]);

  // --- Pagination ---
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // --- Extract emails from selected leads ---
  const handleExtractEmails = async () => {
    if (selectedIds.length === 0) {
      toast.error('Select leads first');
      return;
    }
    setExtracting(true);
    const toastId = toast.loading(`Extracting emails from ${selectedIds.length} websites...`);
    try {
      const res = await api.post('/email/bulk-extract-from-leads', { leadIds: selectedIds });
      toast.success(`Extracted ${res.data.totalNewEmails} new emails`, { id: toastId });
      await fetchLeads();
    } catch (err) {
      toast.error('Extraction failed', { id: toastId });
    } finally {
      setExtracting(false);
    }
  };

  // --- Copy URLs ---
  const handleCopyUrls = () => {
    const selectedLeads = filtered.filter(l => selectedIds.includes(l._id));
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
    toast.success(`Copied ${urls.split('\n').length} URLs`);
  };

  // --- Delete selected leads ---
  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No leads selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} leads?`)) return;
    try {
      for (const id of selectedIds) {
        await api.delete(`/leads/${id}`);
      }
      await fetchLeads();
      setSelectedIds([]);
      toast.success(`${selectedIds.length} leads deleted`);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // --- Export Excel ---
  const exportExcel = () => {
    if (filtered.length === 0) {
      toast.error('No data');
      return;
    }
    const data = filtered.map(l => ({
      Name: l.name,
      Phone: l.phone,
      Website: l.website,
      Address: l.address,
      Rating: l.rating,
      ExtractedEmail: l.email || 'Not extracted'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WebsiteIntelligence');
    XLSX.writeFile(wb, `website_intelligence_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // --- Toggle select ---
  const toggleSelectAll = () => {
    if (selectedIds.length === currentLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentLeads.map(l => l._id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading leads...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Website Intelligence
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border rounded-lg p-2 flex-1 min-w-[150px]"
          />
          <input
            type="text"
            placeholder="City filter"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="border rounded-lg p-2 flex-1 min-w-[150px]"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm">Min Rating:</span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-32"
            />
            <span className="text-sm">{filters.minRating}★</span>
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
            {selectedIds.length === currentLeads.length ? '☑️' : '☐'} Select All
          </button>
          <button
            onClick={handleExtractEmails}
            disabled={extracting}
            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
          >
            {extracting ? <FaSpinner className="animate-spin" size={18} /> : '📧'}
            {extracting ? 'Extracting...' : 'Extract Emails'}
          </button>
          <button
            onClick={handleCopyUrls}
            className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
          >
            <span className="text-lg">📋</span> Copy URLs
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
          >
            <span className="text-lg">🗑️</span> Delete
          </button>
          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm"
          >
            <span className="text-lg">📊</span> Excel
          </button>
        </div>
        <div className="text-sm font-medium">
          {selectedIds.length} selected / {filtered.length} total
        </div>
      </div>

      {/* Table */}
      {currentLeads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">No leads with websites found</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Select</th>
                <th className="text-left">Name</th>
                <th>Website</th>
                <th>Extracted Email</th>
                <th>Phone</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map(lead => (
                <tr key={lead._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(lead._id)}
                      onChange={() => toggleSelect(lead._id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">
                    <a href={lead.website} target="_blank" className="text-purple-600 hover:underline truncate max-w-xs block">
                      {lead.website}
                    </a>
                  </td>
                  <td className="p-3">{lead.email || '❌ Not extracted'}</td>
                  <td className="p-3">{lead.phone || '-'}</td>
                  <td className="p-3">{lead.rating || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
};

export default WebsiteIntelligence;
