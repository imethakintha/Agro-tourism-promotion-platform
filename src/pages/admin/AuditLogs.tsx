import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/adminService';
import { Loader2, Clock } from 'lucide-react';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then(res => {
        setLogs(res.data);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary"/></div>;

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {logs.map(log => (
                        <tr key={log._id}>
                            <td className="px-6 py-4 text-gray-500 flex items-center">
                                <Clock size={14} className="mr-2"/> {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {log.performedBy?.fullName || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-blue-600">
                                {log.action}
                            </td>
                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                {JSON.stringify(log.details)}
                            </td>
                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                {log.ipAddress}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default AuditLogs;