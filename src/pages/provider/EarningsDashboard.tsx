import React, { useEffect, useState } from 'react';
import { getProviderEarnings } from '../../services/paymentService';
import { DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react';

const EarningsDashboard: React.FC = () => {
    const [data, setData] = useState<any>({
        totalEarned: 0,
        pendingPayout: 0,
        history: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Function to fetch data
        const fetchData = async () => {
            try {
                const res = await getProviderEarnings();
                setData(res.data);
            } catch (error) {
                console.error("Failed to load earnings:", error);
            } finally {
                // 👇 වැදගත්ම දේ: Error ආවත් නැතත් Loading නවත්වන්න
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Financial Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-500 font-medium">Total Earnings</h3>
                        <div className="p-2 bg-green-100 rounded-full text-green-600"><DollarSign size={20} /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">LKR {data.totalEarned.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center"><TrendingUp size={12} className="mr-1" /> Lifetime</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-gray-500 font-medium">Pending Payout</h3>
                        <div className="p-2 bg-amber-100 rounded-full text-amber-600"><Clock size={20} /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">LKR {data.pendingPayout.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Scheduled for next Sunday</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Payout History</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.history.map((payout: any) => (
                            <tr key={payout._id}>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(payout.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(payout.payoutPeriod.startDate).toLocaleDateString()} - {new Date(payout.payoutPeriod.endDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold">LKR {payout.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${payout.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {payout.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {data.history.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No payout history.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EarningsDashboard;