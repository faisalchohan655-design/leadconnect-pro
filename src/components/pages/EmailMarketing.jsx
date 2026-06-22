import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FaEnvelope, FaCopy, FaTrash, FaCheckSquare, FaSquare, FaSpinner } from 'react-icons/fa';

const EmailMarketing = () => {
  const { leads } = useLeads();
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCountry, setFilterCountry] = useState('');
  const [filterDomain, setFilterDomain] = useState('');

  const emailLeads = leads.filter(l => l.email && l.email.trim());

  let filteredLeads = emailLeads;
  if (filterCountry) {
    filteredLeads = filteredLeads.filter(l =>
      l.address?.toLowerCase().includes(filterCountry.toLowerCase())
    );
  }
  if (filterDomain) {
    filteredLeads = filteredLeads.filter(l =>
      l.email?.endsWith('@' + filterDomain)
    );
  }

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const toggleSelectAll = () => {
    if (selected.length === currentLeads.length) setSelected([]);
    else setSelected(currentLeads.map(l => l._id));
  };

  const toggleSelect = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(i => i !== id));
    else setSelected([...selected, id]);
  };

  const copyEmails = () => {
    const selectedLeads = filteredLeads.filter(l => selected.includes(l._id));
    if (selectedLeads.length === 0) return toast.error('No emails selected');
    const emails = selectedLeads.map(l => l.email).join('\n');
    navigator.clipboard.writeText(emails);
    toast.success(`Copied ${selectedLeads.length} emails`);
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return toast.error('No leads selected');
    if (!window.confirm(`Delete ${selected.length} leads?`)) return;
    try {
      for (const id of selected) await api.delete(`/leads/${id}`);
      toast.success(`${selected.length} leads deleted`);
      setSelected([]);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const sendEmails = async () => {
    if (selected.length === 0) return toast.error('No leads selected');
    if (!subject || !message) return toast.error('Subject and message required');

    const recipients = filteredLeads.filter(l => selected.includes(l._id)).map(l => l.email);
    setSending(true);
    const toastId = toast.loading(`Sending to ${recipients.length} recipients...`);

    try {
      const response = await api.post('/email/bulk-send', {
        recipients,
        subject,
        message: message.replace(/\n/g, '<br>')
      });
      toast.success(`✅ Sent to ${response.data.sent || recipients.length} recipients`, { id: toastId });
      setSelected([]);
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Send failed', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  const exportCSV = () => {
    if (filteredLeads.length === 0) return toast.error('No data');
    const headers = ['Name', 'Email', 'Phone', 'Website', 'Address', 'Rating'];
    const rows = filteredLeads.map(l => [l.name, l.email, l.phone || '', l.website || '', l.address || '', l.rating || '']);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `email_leads_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(blob);
    toast.success('CSV exported');
  };

  const exportExcel = () => {
    if (filteredLeads.length === 0) return toast.error('No data');
    const data = filteredLeads.map(l => ({
      Name: l.name, Email: l.email, Phone: l.phone || '', Website: l.website || '', Address: l.address || '', Rating: l.rating || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EmailLeads');
    XLSX.writeFile(wb, `email_leads_${Date.now()}.xlsx`);
    toast.success('Excel exported');
  };

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        📧 Email Marketing
      </h1>
      <p className="text-gray-500 mb-6">Send bulk emails to your leads</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Total Emails</p>
          <p className="text-2xl font-bold text-purple-600">{emailLeads.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Selected</p>
          <p className="text-2xl font-bold text-blue-600">{selected.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Unique Domains</p>
          <p className="text-2xl font-bold text-green-600">
            {new Set(emailLeads.map(l => l.email?.split('@')[1])).size}
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filter by country"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="border rounded-lg p-2 text-sm flex-1"
        />
        <input
          type="text"
          placeholder="Filter by domain (e.g., gmail.com)"
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          className="border rounded-lg p-2 text-sm flex-1"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">✉️ Compose Campaign</h3>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3 focus:ring-2 focus:ring-purple-500"
        />
        <textarea
          rows="6"
          placeholder="Message (HTML supported)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded-xl p-3 mb-3 focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={sendEmails}
          disabled={sending}
          className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
        >
          {sending ? <FaSpinner className="animate-spin" /> : <FaEnvelope />}
          {sending ? 'Sending...' : 'Send Email'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={toggleSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            {selected.length === currentLeads.length ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
            Select All
          </button>
          <button onClick={copyEmails} className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaCopy size={18} /> Copy Emails
          </button>
          <button onClick={deleteSelected} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            <FaTrash size={18} /> Delete
          </button>
          <button onClick={exportCSV} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            📄 CSV
          </button>
          <button onClick={exportExcel} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
            📊 Excel
          </button>
        </div>
        <div className="text-sm font-medium">
          {selected.length} selected / {filteredLeads.length} total
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Select</th>
              <th className="text-left">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Website</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map((lead) => (
              <tr key={lead._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <input type="checkbox" checked={selected.includes(lead._id)} onChange={() => toggleSelect(lead._id)} className="w-4 h-4" />
                </td>
                <td className="p-3 font-medium">{lead.name}</td>
                <td className="p-3">{lead.email}</td>
                <td className="p-3">{lead.phone || '-'}</td>
                <td className="p-3">
                  {lead.website ? <a href={lead.website} target="_blank" className="text-purple-600 hover:underline">Visit</a> : '-'}
                </td>
                <td className="p-3">{lead.rating || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">◀ Prev</button>
          <span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50">Next ▶</button>
        </div>
      )}
    </div>
  );
};

export default EmailMarketing;
