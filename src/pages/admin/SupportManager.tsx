import React, { useEffect, useState } from 'react';
import { getAllTickets, updateTicketStatus } from '../../services/supportService';
import { Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportManager: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
      setLoading(true);
      try {
          const res = await getAllTickets();
          setTickets(res.data);
      } catch(err) { console.error(err); } 
      finally { setLoading(false); }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleStatusChange = async (id: string, status: string) => {
      await updateTicketStatus(id, status);
      loadTickets();
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map(ticket => (
                        <tr key={ticket._id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.ticketNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                <div>{ticket.userId?.fullName}</div>
                                <div className="text-xs text-gray-400">{ticket.userId?.email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800">{ticket.subject}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs rounded ${ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{ticket.priority}</span>
                            </td>
                            <td className="px-6 py-4">
                                <select 
                                   value={ticket.status} 
                                   onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                   className="text-xs border rounded p-1 bg-gray-50"
                                >
                                    <option>Open</option>
                                    <option>Replied</option>
                                    <option>Closed</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link to={`/support/ticket/${ticket._id}`} className="text-primary hover:underline flex items-center justify-end">
                                    <Eye size={16} className="mr-1"/> View
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default SupportManager;