import React, { useEffect, useState } from 'react';
import { getAllFeedbacks, updateFeedbackStatus, deleteFeedback } from '../../services/feedbackService';
import { 
    Loader2, Search, Filter, Mail, MessageSquare, AlertCircle, 
    CheckCircle, Clock, Trash2, ChevronDown 
} from 'lucide-react';

const FeedbackManagement = () => {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    // Load data
    const fetchFeedbacks = async () => {
        try {
            const res = await getAllFeedbacks();
            setFeedbacks(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Status Update Handler
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateFeedbackStatus(id, { status: newStatus });
            // Local update to avoid reload
            setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status: newStatus } : f));
        } catch (error) {
            alert('Update failed');
        }
    };

    // Delete Handler
    const handleDelete = async (id: string) => {
        if(!window.confirm("Are you sure?")) return;
        try {
            await deleteFeedback(id);
            setFeedbacks(feedbacks.filter(f => f._id !== id));
        } catch (error) {
            alert('Delete failed');
        }
    };

    // Filtering logic
    const filteredFeedbacks = filter === 'All' 
        ? feedbacks 
        : feedbacks.filter(f => f.status === filter || f.category === filter);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'New': return 'bg-blue-100 text-blue-700';
            case 'Read': return 'bg-yellow-100 text-yellow-700';
            case 'Replied': return 'bg-green-100 text-green-700';
            case 'Closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100';
        }
    };

    if (loading) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin text-green-600" /></div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Feedback Center</h1>
                    <p className="text-gray-500">Manage user inquiries and reports</p>
                </div>
                <div className="flex gap-3">
                    <select 
                        className="px-4 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="All">All Feedbacks</option>
                        <option value="New">New</option>
                        <option value="Bug">Bugs</option>
                        <option value="Suggestion">Suggestions</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredFeedbacks.map((item) => (
                    <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-full h-fit ${item.category === 'Bug' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {item.category === 'Bug' ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{item.subject}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <span className="font-medium text-gray-700">{item.name}</span>
                                        <span>•</span>
                                        <span>{item.email}</span>
                                        <span>•</span>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="mt-3 text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                        {item.message}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 min-w-[150px]">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                                
                                <div className="flex items-center gap-2 mt-2">
                                    <select 
                                        value={item.status}
                                        onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                                        className="text-sm border-gray-200 border rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:bg-gray-50"
                                    >
                                        <option value="New">New</option>
                                        <option value="Read">Read</option>
                                        <option value="Replied">Replied</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                    
                                    <button 
                                        onClick={() => handleDelete(item._id)}
                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredFeedbacks.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No feedbacks found matching your filter.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackManagement;