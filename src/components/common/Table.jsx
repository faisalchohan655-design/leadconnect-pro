import { FaWhatsapp, FaEnvelope, FaEye, FaTrash } from 'react-icons/fa';

const Table = ({ leads, selected, onToggleSelect, onToggleSelectAll, onAction, columns = [] }) => {
  const defaultColumns = [
    { key: 'select', label: 'Select', render: (lead, idx) => (
      <input type="checkbox" checked={selected.includes(idx)} onChange={() => onToggleSelect(idx)} className="w-4 h-4" />
    )},
    { key: 'name', label: 'Name', render: (lead) => <span className="font-medium">{lead.name || '-'}</span> },
    { key: 'contact', label: 'Contact', render: (lead) => <span>{lead.contactPerson || '-'}</span> },
    { key: 'phone', label: 'Phone', render: (lead) => <span>{lead.phone || '-'}</span> },
    { key: 'email', label: 'Email', render: (lead) => <span>{lead.email || '-'}</span> },
    { key: 'website', label: 'Website', render: (lead) => lead.website ? <a href={lead.website} target="_blank" className="text-blue-600 hover:underline">Visit</a> : '-' },
    { key: 'rating', label: 'Rating', render: (lead) => <span>{lead.rating ? `${lead.rating}★` : '-'}</span> },
    { key: 'actions', label: 'Actions', render: (lead) => (
      <div className="flex gap-2 items-center">
        {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/\D/g,'')}`} target="_blank" className="text-green-600"><FaWhatsapp size={18} /></a>}
        {lead.email && <a href={`mailto:${lead.email}`} className="text-blue-600"><FaEnvelope size={18} /></a>}
        {lead.website && <a href={lead.website} target="_blank" className="text-purple-600"><FaEye size={18} /></a>}
        <button onClick={() => onAction('delete', lead._id)} className="text-red-500"><FaTrash size={18} /></button>
      </div>
    )}
  ];

  const cols = columns.length ? columns : defaultColumns;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {cols.map((col, i) => (
              <th key={i} className="p-3 text-left text-xs font-medium text-gray-500 uppercase">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr key={lead._id || idx} className="border-t hover:bg-gray-50">
              {cols.map((col, j) => (
                <td key={j} className="p-3">{col.render(lead, idx)}</td>
              ))}
            </tr>
          ))}
          {leads.length === 0 && (
            <tr><td colSpan={cols.length} className="text-center p-10 text-gray-500">No leads found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
export default Table;
