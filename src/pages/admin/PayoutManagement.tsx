import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getAllPayouts, processPayout } from '../../services/paymentService';
import { Loader2, CheckCircle, Play } from 'lucide-react';

const PayoutManagement: React.FC = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getAllPayouts();
            setPayouts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleProcess = async (id: string) => {
        if (!window.confirm("Confirm transfer processing?")) return;
        try {
            await processPayout(id);
            alert('Payout Processed');
            loadData();
        } catch (err) {
            alert('Failed to process');
        }
    };

    const handleGenerate = async () => {
        if (!window.confirm("Run weekly payout generation manually? This will calculate earnings for all completed bookings.")) return;
        setGenerating(true);
        try {
            await api.post('/admin/payouts/generate');
            alert('Payouts generated successfully!');
            loadData(); // Table එක Refresh කරන්න
        } catch (err) {
            alert('Failed to generate payouts');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Payout Management</h1>

                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm disabled:opacity-50"
                >
                    {generating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                    Run Weekly Payouts
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payouts.map(payout => (
                            <tr key={payout._id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{payout.userId?.fullName}</div>
                                    <div className="text-xs text-gray-500">{payout.userId?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{payout.userRole}</td>
                                <td className="px-6 py-4 text-sm font-bold">LKR {payout.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${payout.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                        {payout.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {payout.status === 'Pending' && (
                                        <button
                                            onClick={() => handleProcess(payout._id)}
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm flex items-center ml-auto"
                                        >
                                            <CheckCircle size={14} className="mr-1" /> Process
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    No payouts generated yet. Click "Run Weekly Payouts" to generate.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayoutManagement;