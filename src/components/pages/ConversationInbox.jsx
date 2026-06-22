import { useEffect, useState } from 'react';
import api from '../../api';
import { useLeads } from '../../context/LeadsContext';

const ConversationInbox = () => {
  const { leads } = useLeads();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch replies from backend
    api.get('/replies')
      .then(res => {
        setReplies(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback: use leads as demo replies
        const demoReplies = leads.slice(0, 5).map((lead, i) => ({
          id: i + 1,
          from: lead.email || 'unknown@example.com',
          subject: `Reply from ${lead.name}`,
          message: `This is a sample reply from ${lead.name}`,
          date: new Date(lead.createdAt).toLocaleString(),
          status: i % 2 === 0 ? 'Unread' : 'Read'
        }));
        setReplies(demoReplies);
        setLoading(false);
      });
  }, [leads]);

  if (loading) return <div className="p-6 text-center">Loading replies...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
        Conversation Inbox
      </h1>
      <p className="text-gray-500 mb-6">Manage all your email replies and conversations</p>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">From</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Message</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((reply) => (
                <tr key={reply.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{reply.from}</td>
                  <td className="p-4">{reply.subject}</td>
                  <td className="p-4 max-w-xs truncate">{reply.message}</td>
                  <td className="p-4">{reply.date}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${reply.status === 'Unread' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {reply.status}
                    </span>
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

export default ConversationInbox;
