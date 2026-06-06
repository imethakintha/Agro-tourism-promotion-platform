import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createTicket, getUserTickets } from '../../services/supportService';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Ticket Form
  const [formData, setFormData] = useState({
      subject: '',
      category: 'Booking',
      priority: 'Medium',
      message: ''
  });

  const loadTickets = async () => {
      setLoading(true);
      try {
          const res = await getUserTickets();
          setTickets(res.data);
      } catch(err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await createTicket(formData);
          setShowModal(false);
          setFormData({ subject: '', category: 'Booking', priority: 'Medium', message: '' });
          loadTickets();
      } catch (err) {
          alert('Failed to create ticket');
      }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-gray-800">Support Tickets</h1>
           <button onClick={() => setShowModal(true)} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
               <Plus size={18} className="mr-2"/> New Ticket
           </button>
       </div>

       {loading ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto"/></div> : (
           <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
               <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                       <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                           <th className="px-6 py-3 text-right"></th>
                       </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                       {tickets.map(ticket => (
                           <tr key={ticket._id}>
                               <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.ticketNumber}</td>
                               <td className="px-6 py-4 text-sm text-gray-700">{ticket.subject}</td>
                               <td className="px-6 py-4 text-sm text-gray-500">{ticket.category}</td>
                               <td className="px-6 py-4">
                                   <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                       {ticket.status}
                                   </span>
                               </td>
                               <td className="px-6 py-4 text-sm text-gray-500">{new Date(ticket.lastReplyAt).toLocaleDateString()}</td>
                               <td className="px-6 py-4 text-right">
                                   <Link to={`/support/ticket/${ticket._id}`} className="text-primary hover:underline text-sm flex items-center justify-end">
                                       <MessageSquare size={14} className="mr-1"/> View
                                   </Link>
                               </td>
                           </tr>
                       ))}
                       {tickets.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">No tickets found.</td></tr>}
                   </tbody>
               </table>
           </div>
       )}

       {showModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
                   <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
                   <form onSubmit={handleSubmit} className="space-y-4">
                       <input 
                         placeholder="Subject" 
                         className="w-full border p-2 rounded" 
                         value={formData.subject}
                         onChange={e => setFormData({...formData, subject: e.target.value})}
                         required
                       />
                       <div className="grid grid-cols-2 gap-4">
                           <select 
                             className="border p-2 rounded"
                             value={formData.category}
                             onChange={e => setFormData({...formData, category: e.target.value})}
                           >
                               <option>Booking</option>
                               <option>Payment</option>
                               <option>Account</option>
                               <option>Technical</option>
                               <option>Other</option>
                           </select>
                           <select 
                             className="border p-2 rounded"
                             value={formData.priority}
                             onChange={e => setFormData({...formData, priority: e.target.value})}
                           >
                               <option>Low</option>
                               <option>Medium</option>
                               <option>High</option>
                           </select>
                       </div>
                       <textarea 
                         rows={4} 
                         placeholder="Describe your issue..." 
                         className="w-full border p-2 rounded"
                         value={formData.message}
                         onChange={e => setFormData({...formData, message: e.target.value})}
                         required
                       ></textarea>
                       <div className="flex justify-end space-x-2">
                           <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                           <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">Submit Ticket</button>
                       </div>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};

export default SupportTickets;