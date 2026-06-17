import { useEffect, useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  FaWhatsapp, FaEnvelope, FaTrash, FaCheckSquare, FaSquare,
  FaFileExcel, FaFileCsv, FaSave, FaCopy, FaEdit, FaCheck, FaClock
} from 'react-icons/fa';

const CampaignOutreach = () => {
  const { leads, fetchLeads } = useLeads();
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingContact, setEditingContact] = useState(null);
  const [tempContactName, setTempContactName] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    minRating: 0,
    source: 'all'
  });

  useEffect(() => {
    fetchLeads();
    setLoading(false);
  }, []);

  useEffect(() => {
    let r = leads;
    if (filters.search) r = r.filter(l => l.name?.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.city) r = r.filter(l => l.address?.toLowerCase().includes(filters.city.toLowerCase()));
    if (filters.minRating > 0) r = r.filter(l => (l.rating || 0) >= filters.minRating);
    if (filters.source !== 'all') r = r.filter(l => (l.source || 'google').toLowerCase() === filters.source.toLowerCase());
    setFiltered(r);
    setSelected([]);
    setCurrentPage(1);
  }, [filters, leads]);

  // --- Pagination ---
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // --- Status options ---
  const statusOptions = ['Untouched', 'Contacted', 'Qualified', 'Not Interested'];
  const getStatusColor = (status) => {
    switch(status) {
      case 'Untouched': return 'bg-gray-100 text-gray-700';
      case 'Contacted': return 'bg-blue-100 text-blue-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      case 'Not Interested': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // --- Delete lead ---
  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      await fetchLeads();
      toast.success('Deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  // --- Bulk delete ---
  const bulkDelete = async () => {
    if (selected.length === 0) return toast.error('No leads selected');
    if (!window.confirm(`Delete ${selected.length} leads?`)) return;
    try {
      for (const id of selected) await api.delete(`/leads/${id}`);
      await fetchLeads();
      setSelected([]);
      toast.success(`${selected.length} leads deleted`);
    } catch (err) {
      toast.error('Bulk delete failed');
    }
  };

  // --- Copy URLs ---
  const copySelectedUrls = () => {
    const selectedLeads = filtered.filter(l => selected.includes(l._id));
    if (selectedLeads.length === 0) return toast.error('No leads selected');
    const urls = selectedLeads.map(l => l.website).filter(url => url && url.trim()).join('\n');
    if (!urls) return toast.error('No websites found');
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${urls.split('\n').length} URLs`);
  };

  // --- Save all leads ---
  const saveAllLeads = async () => {
    if (filtered.length === 0) return toast.error('No leads to save');
    if (saving) return;
    setSaving(true);
    const toastId = toast.loading(`Saving ${filtered.length} leads...`);
    try {
      const response = await api.post('/leads/bulk', { leads: filtered });
      if (response.data.success) {
        toast.success(`✅ Saved ${response.data.saved || filtered.length} leads!`, { id: toastId });
        await fetchLeads();
      } else {
        toast.error(response.data.error || 'Failed to save', { id: toastId });
      }
    } catch (error) {
      toast.error('Save failed', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // --- Bulk WhatsApp ---
  const bulkWhatsApp = () => {
    const withPhone = filtered.filter(l => selected.includes(l._id) && l.phone);
    if (withPhone.length === 0) return toast.error('No phone numbers');
    withPhone.forEach(l => window.open(`https://wa.me/${l.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello from LeadConnect')}`));
    toast.success(`Opened ${withPhone.length} chats`);
  };

  // --- Bulk Email ---
  const bulkEmail = () => {
    const withEmail = filtered.filter(l => selected.includes(l._id) && l.email);
    if (withEmail.length === 0) return toast.error('No emails');
    window.location.href = `mailto:${withEmail.map(l => l.email).join(',')}?subject=Business%20Opportunity`;
    toast.success(`Opened email for ${withEmail.length} leads`);
  };

  // --- Update status ---
  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/leads/${id}`, { status: newStatus });
      await fetchLeads();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // --- Update contact person ---
  const updateContactPerson = async (id, name) => {
    try {
      await api.patch(`/leads/${id}`, { contactPerson: name });
      await fetchLeads();
      toast.success('Contact name saved');
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  // --- Export CSV ---
  const exportCSV = () => {
    if (filtered.length === 0) return toast.error('No data to export');
    const headers = ['Name', 'Contact', 'Phone', 'Email', 'Rating', 'Source', 'Website'];
    const rows = filtered.map(l => [l.name, l.contactPerson || '', l.phone, l.email, l.rating, l.source || 'Google', l.website || '']);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `campaign_leads_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(blob);
    toast.success('CSV exported');
  };

  // --- Export Excel ---
  const exportExcel = () => {
    if (filtered.length === 0) return toast.error('No data');
    const data = filtered.map(l => ({
      Name: l.name,
      Contact: l.contactPerson || '',
      Phone: l.phone,
      Email: l.email,
      Rating: l.rating,
      Source: l.source || 'Google',
      Website: l.website || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CampaignLeads');
    XLSX.writeFile(wb, `campaign_leads_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  // --- Toggle select ---
  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) setSelected([]);
    else setSelected(currentLeads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  // --- Status icon ---
  const getStatusIcon = (status) => {
    if (status === 'Converted') return <FaCheck className="text-green-600" />;
    if (status === 'Contacted') return <FaEdit className="text-blue-600" />;
    return <FaClock className="text-gray-400" />;
  };

  if (loading) return <div className="p-6 text-center">Loading leads...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Campaign Outreach
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Min Rating</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm">{filters.minRating}★</span>
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              type="text"
              placeholder="e.g., Karachi"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Search by name</label>
            <input
              type="text"
              placeholder="Business name"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Lead Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="border rounded-lg p-2 w-full"
            >
              <option value="all">All</option>
              <option value="google">Google Maps</option>
              <option value="facebook">Facebook</option>
              <option value="social">Social Insights</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={toggleSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaCheckSquare size={18} /> Select All
          </button>
          <button onClick={saveAllLeads} disabled={saving} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaSave size={18} /> {saving ? 'Saving...' : 'Save All'}
          </button>
          <button onClick={copySelectedUrls} className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaCopy size={18} /> Copy URLs
          </button>
          <button onClick={bulkWhatsApp} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaWhatsapp size={18} /> WhatsApp
          </button>
          <button onClick={bulkEmail} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaEnvelope size={18} /> Email
          </button>
          <button onClick={bulkDelete} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaTrash size={18} /> Delete
          </button>
          <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaFileCsv size={18} /> CSV
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaFileExcel size={18} /> Excel
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => setViewMode('cards')} className={`px-3 py-1 rounded text-sm ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded text-sm ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Table</button>
          </div>
          <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border rounded p-1 text-sm">
            <option>10</option><option>25</option><option>50</option>
          </select>
          <span className="text-sm font-medium">{selected.length} selected / {filtered.length} total</span>
        </div>
      </div>

      {/* Table */}
      {currentLeads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">No leads match filters</div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentLeads.map(lead => (
            <div key={lead._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(lead._id)}>
                    {selected.includes(lead._id) ? <FaCheckSquare className="text-purple-600" /> : <FaSquare className="text-gray-400" />}
                  </button>
                  <h3 className="font-bold text-sm">{lead.name}</h3>
                </div>
                <button onClick={() => deleteLead(lead._id)} className="text-red-500"><FaTrash size={16} /></button>
              </div>
              <p className="text-gray-500 text-xs truncate">{lead.address || 'No address'}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">{lead.rating || 'N/A'}★</span>
                <div className="flex gap-2">
                  {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600"><FaWhatsapp size={16} /></a>}
                  {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope size={16} /></a>}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  {getStatusIcon(lead.status || 'Untouched')}
                  <select
                    value={lead.status || 'Untouched'}
                    onChange={(e) => updateStatus(lead._id, e.target.value)}
                    className={`text-xs rounded-full px-2 py-0.5 ${getStatusColor(lead.status || 'Untouched')} border-0 cursor-pointer`}
                  >
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const note = prompt('Contact Person:', lead.contactPerson || '');
                    if (note !== null) updateContactPerson(lead._id, note);
                  }}
                  className="text-gray-500 text-xs underline"
                >
                  {lead.contactPerson || 'Add Contact'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3"><button onClick={toggleSelectAll}>{selected.length === currentLeads.length ? <FaCheckSquare size={16} /> : <FaSquare size={16} />}</button></th>
                <th>Name</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.map(lead => (
                <tr key={lead._id} className="border-t hover:bg-gray-50">
                  <td className="p-3"><input type="checkbox" checked={selected.includes(lead._id)} onChange={() => toggleSelect(lead._id)} className="w-4 h-4" /></td>
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.contactPerson || '-'}</td>
                  <td className="p-3">{lead.phone || '-'}</td>
                  <td className="p-3">{lead.email || '-'}</td>
                  <td className="p-3">{lead.rating || '-'}</td>
                  <td className="p-3">
                    <select
                      value={lead.status || 'Untouched'}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      className={`text-xs rounded-full px-2 py-1 ${getStatusColor(lead.status || 'Untouched')} border-0 cursor-pointer`}
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3 flex gap-2 items-center">
                    {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600"><FaWhatsapp size={18} /></a>}
                    {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope size={18} /></a>}
                    <button onClick={() => deleteLead(lead._id)} className="text-red-500"><FaTrash size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      )}
    </div>
  );
};

export default CampaignOutreach;
