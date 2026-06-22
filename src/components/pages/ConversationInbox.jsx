import { useState } from 'react';

const ConversationInbox = () => {
  // Sample reply data (will be replaced with real data later)
  const [replies] = useState([
    { id: 1, from: 'john@example.com', subject: 'Interested in your services', message: 'Hi, I saw your lead generation tool. Can we schedule a demo?', date: '2026-06-21 10:30 AM', status: 'Unread' },
    { id: 2, from: 'sarah@company.com', subject: 'Partnership inquiry', message: 'We are looking for a lead generation partner. Let\'s talk.', date: '2026-06-20 3:15 PM', status: 'Read' },
    { id: 3, from: 'mike@startup.io', subject: 'Question about pricing', message: 'Do you offer discounts for annual subscriptions?', date: '2026-06-19 9:00 AM', status: 'Read' },
  ]);

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
