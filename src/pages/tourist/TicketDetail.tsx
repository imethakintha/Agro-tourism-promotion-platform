import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketDetails, replyToTicket } from '../../services/supportService';
import { Send, Loader2, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if(id) {
          getTicketDetails(id).then(res => {
              setTicket(res.data);
              setLoading(false);
          });
      }
  }, [id]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket]);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!reply.trim()) return;
      
      try {
          const res = await replyToTicket(id!, reply);
          setTicket(res.data);
          setReply('');
      } catch(err) {
          alert('Failed to send reply');
      }
  };

  if (loading) return <div className="text-center p-10"><Loader2 className="animate-spin mx-auto"/></div>;
  if (!ticket) return <div className="text-center p-10">Ticket not found</div>;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div className="bg-white p-6 border-b shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">{ticket.subject}</h1>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                        <span>{ticket.ticketNumber}</span>
                        <span>•</span>
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${ticket.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {ticket.priority}
                        </span>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    {ticket.status}
                </span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {ticket.messages.map((msg: any, idx: number) => {
                const isMe = msg.senderId === user?.id;
                return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl p-4 shadow-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-200 rounded-bl-none'}`}>
                            <div className={`text-xs mb-1 flex items-center ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                {msg.senderRole === 'Administrator' ? <Shield size={12} className="mr-1"/> : <User size={12} className="mr-1"/>}
                                {msg.senderRole === 'Administrator' ? 'Support Team' : 'You'} • {new Date(msg.timestamp).toLocaleString()}
                            </div>
                            <p className="text-sm whitespace-pre-line">{msg.message}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="bg-white p-4 border-t flex gap-2">
            <textarea 
                className="flex-1 border rounded-lg p-3 focus:ring-primary focus:border-primary resize-none"
                rows={2}
                placeholder="Type your reply..."
                value={reply}
                onChange={e => setReply(e.target.value)}
            ></textarea>
            <button type="submit" className="bg-primary text-white px-6 rounded-lg hover:bg-green-700">
                <Send size={20} />
            </button>
        </form>
    </div>
  );
};

export default TicketDetail;