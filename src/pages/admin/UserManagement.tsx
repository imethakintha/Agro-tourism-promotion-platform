import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserStatus } from '../../services/adminService';
import { Loader2, Search, Shield, Ban, Check } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(search, roleFilter);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
      if(!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
      try {
          await updateUserStatus(userId, newStatus);
          fetchUsers();
      } catch (error) {
          alert('Failed to update status');
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex space-x-2">
            <div className="relative">
                <input 
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:outline-none"
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            <select 
                className="border rounded-lg px-4 py-2"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
            >
                <option value="">All Roles</option>
                <option value="Tourist">Tourist</option>
                <option value="Farmer">Farmer</option>
                <option value="TourGuide">Guide</option>
                <option value="TransportProvider">Transport</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></td></tr>
                ) : users.map(user => (
                    <tr key={user._id}>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.role}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${user.accountStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.accountStatus}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {user.emailVerified ? <Check size={16} className="text-green-500"/> : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            {user.accountStatus === 'Active' ? (
                                <button 
                                    onClick={() => handleStatusChange(user._id, 'Suspended')}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded" 
                                    title="Suspend"
                                >
                                    <Ban size={16} />
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleStatusChange(user._id, 'Active')}
                                    className="text-green-500 hover:bg-green-50 p-2 rounded" 
                                    title="Activate"
                                >
                                    <Shield size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;