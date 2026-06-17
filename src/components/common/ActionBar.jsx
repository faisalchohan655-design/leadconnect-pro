import { FaCheckSquare, FaSquare, FaSave, FaCopy, FaWhatsapp, FaEnvelope, FaTrash, FaFileCsv, FaFileExcel } from 'react-icons/fa';

const ActionBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onSave,
  onCopyUrls,
  onWhatsApp,
  onEmail,
  onDelete,
  onExportCSV,
  onExportExcel,
  saving = false,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-3 mb-6 flex flex-wrap items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={onSelectAll} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          {selectedCount === totalCount ? <FaCheckSquare size={18} /> : <FaSquare size={18} />}
          Select All
        </button>
        <button onClick={onSave} disabled={saving || disabled} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaSave size={18} /> {saving ? 'Saving...' : 'Save All'}
        </button>
        <button onClick={onCopyUrls} disabled={disabled} className="bg-cyan-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaCopy size={18} /> Copy URLs
        </button>
        <button onClick={onWhatsApp} disabled={disabled} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaWhatsapp size={18} /> WhatsApp
        </button>
        <button onClick={onEmail} disabled={disabled} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaEnvelope size={18} /> Email
        </button>
        <button onClick={onDelete} disabled={disabled} className="bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaTrash size={18} /> Delete
        </button>
        <button onClick={onExportCSV} disabled={disabled} className="bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaFileCsv size={18} /> CSV
        </button>
        <button onClick={onExportExcel} disabled={disabled} className="bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm">
          <FaFileExcel size={18} /> Excel
        </button>
      </div>
      <div className="text-sm font-medium">{selectedCount} selected / {totalCount} total</div>
    </div>
  );
};
export default ActionBar;
