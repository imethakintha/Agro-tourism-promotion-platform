import React, { useEffect, useState } from 'react';
import { getPaymentHistory } from '../../services/paymentService';
import { Loader2, CreditCard } from 'lucide-react';

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentHistory().then(res => {
        setPayments(res.data);
        setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary"/></div>;

  return (
    <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <CreditCard className="mr-3"/> Payment History
        </h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Method</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map(payment => (
                        <tr key={payment._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {payment.bookingId?.activityId?.customTitle || 'Booking'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                LKR {payment.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${payment.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                    {payment.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                {payment.paymentMethod}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {payments.length === 0 && <div className="p-6 text-center text-gray-500">No payment history found.</div>}
        </div>
    </div>
  );
};

export default PaymentHistory;