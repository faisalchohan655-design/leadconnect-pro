import { useState } from 'react';
import { FaWhatsapp, FaCopy, FaTrash } from 'react-icons/fa';

const WhatsAppOutreach = () => {
  const [contacts] = useState([
    { id: 1, name: 'Ahmed Ali', phone: '+923001234567', status: 'Active', lastContact: '2026-06-20' },
    { id: 2, name: 'Fatima Khan', phone: '+923001234568', status: 'Active', lastContact: '2026-06-19' },
    { id: 3, name: 'Muhammad Hassan', phone: '+923001234569', status: 'Pending', lastContact: '2026-06-18' },
    { id: 4, name: 'Zainab Ahmed', phone: '+923001234570', status: 'Active', lastContact: '2026-06-17' },
    { id: 5, name: 'Usman Farooq', phone: '+923001234571', status: 'Inactive', lastContact: '2026-06-16' },
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        WhatsApp Outreach
      </h1>
      <p className="text-gray-500 mb-6">Manage your WhatsApp contacts and campaigns</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Total Contacts</p>
          <p className="text-2xl font-bold text-purple-600">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{contacts.filter(c => c.status === 'Active').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{contacts.filter(c => c.status === 'Pending').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Last Contact</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{contact.name}</td>
                  <td className="p-4">{contact.phone}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-4">{contact.lastContact}</td>
                  <td className="p-4 flex gap-2">
                    <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" className="text-green-600 hover:text-green-800">
                      <FaWhatsapp size={18} />
                    </a>
                    <button className="text-gray-600 hover:text-gray-800">
                      <FaCopy size={18} />
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppOutreach;
