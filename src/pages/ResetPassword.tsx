import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        return setError('Passwords do not match');
    }
    if (password.length < 8) {
        return setError('Password must be at least 8 characters');
    }

    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token!, password);
      alert('Password reset successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center"
            >
                {loading ? <Loader2 className="animate-spin"/> : 'Reset Password'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;