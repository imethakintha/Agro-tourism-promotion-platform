import React, { useEffect, useState } from 'react';
import { getPendingVerifications, verifyProvider } from '../../services/adminService';
import { CheckCircle, XCircle, AlertCircle, Loader2, Eye } from 'lucide-react';

const VerificationQueue: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await getPendingVerifications();
      setVerifications(data.data);
    } catch (error) {
      console.error('Failed to load verifications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
     if (!selectedProvider) return;
     try {
        await verifyProvider(selectedProvider._id, {
           action,
           comments: comment,
           providerType: selectedProvider.providerType
        });
        alert(`Provider ${action} successfully`);
        setSelectedProvider(null);
        loadVerifications();
     } catch (error) {
        console.error('Verification action failed', error);
        alert('Action failed');
     }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Verification Queue</h1>

      {!selectedProvider ? (
         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {verifications.map((item) => (
                     <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm font-medium text-gray-900">{item.farmName || item.userId.fullName}</div>
                           <div className="text-sm text-gray-500">{item.userId.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.providerType}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <button onClick={() => setSelectedProvider(item)} className="text-primary hover:text-green-900 flex items-center justify-end ml-auto">
                              <Eye size={16} className="mr-1" /> Review
                           </button>
                        </td>
                     </tr>
                  ))}
                  {verifications.length === 0 && (
                     <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No pending verifications</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      ) : (
         <div className="bg-white p-8 rounded-xl shadow-md">
             <button onClick={() => setSelectedProvider(null)} className="mb-4 text-gray-500 hover:text-gray-700">&larr; Back to List</button>
             
             <div className="grid grid-cols-2 gap-8">
                 <div>
                    <h2 className="text-xl font-bold mb-4">Details</h2>
                    <div className="space-y-2">
                       <p><span className="font-medium">Type:</span> {selectedProvider.providerType}</p>
                       <p><span className="font-medium">Name:</span> {selectedProvider.farmName || selectedProvider.userId.fullName}</p>
                       {selectedProvider.licenseNumber && <p><span className="font-medium">License:</span> {selectedProvider.licenseNumber}</p>}
                       {selectedProvider.vehicleRegistrationNo && <p><span className="font-medium">Vehicle Reg:</span> {selectedProvider.vehicleRegistrationNo}</p>}
                       <p className="mt-4 text-gray-600">{selectedProvider.description || selectedProvider.bio}</p>
                    </div>
                 </div>
                 
                 <div>
                    <h2 className="text-xl font-bold mb-4">Documents</h2>
                    <ul className="space-y-3">
                       {selectedProvider.documents.map((doc: any, idx: number) => (
                          <li key={idx} className="flex items-center justify-between border p-3 rounded bg-gray-50">
                             <span className="text-sm font-medium">{doc.documentType}</span>
                             <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">View</a>
                          </li>
                       ))}
                    </ul>
                 </div>
             </div>

             <div className="mt-8 border-t pt-6">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Admin Comments</label>
                 <textarea 
                    className="w-full border rounded-lg p-3 mb-4" 
                    rows={3} 
                    placeholder="Reason for rejection or requested changes..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                 ></textarea>
                 
                 <div className="flex space-x-4">
                    <button onClick={() => handleAction('Approved')} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center">
                       <CheckCircle size={18} className="mr-2" /> Approve
                    </button>
                    <button onClick={() => handleAction('Requested Changes')} className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 flex justify-center items-center">
                       <AlertCircle size={18} className="mr-2" /> Request Changes
                    </button>
                    <button onClick={() => handleAction('Rejected')} className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex justify-center items-center">
                       <XCircle size={18} className="mr-2" /> Reject
                    </button>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
};

export default VerificationQueue;