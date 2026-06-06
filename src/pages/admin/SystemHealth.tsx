import React, { useEffect, useState } from 'react';
import { getSystemLogs } from '../../services/adminService';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const SystemHealth: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemLogs().then(res => {
        setLogs(res.data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">System Health</h1>
        
        <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-100 flex items-center">
                <CheckCircle className="text-green-500 h-10 w-10 mr-4"/>
                <div>
                    <h3 className="font-bold text-green-800">API Status</h3>
                    <p className="text-green-600 text-sm">Operational</p>
                </div>
            </div>
            {/* Placeholder stats */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-700">Uptime</h3>
                <p className="text-2xl font-bold">99.9%</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-700">Response Time</h3>
                <p className="text-2xl font-bold">120ms</p>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">System Logs</h2>
            {loading ? <Loader2 className="animate-spin"/> : (
                <div className="space-y-2 font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i}>
                            <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                            <span className={log.level === 'ERROR' ? 'text-red-500' : 'text-blue-400'}>{log.level}</span>:{' '}
                            {log.message}
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-gray-500">No logs available.</div>}
                </div>
            )}
        </div>
    </div>
  );
};

export default SystemHealth;