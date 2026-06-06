import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <Link to="/login" className="text-gray-500 hover:text-gray-700 flex items-center mb-6 text-sm">
           <ArrowLeft size={16} className="mr-1"/> Back to Login
        </Link>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter your email address and we'll send you a link to reset your password.</p>

        {success ? (
           <div className="bg-green-50 p-4 rounded-lg text-center">
               <CheckCircle className="mx-auto text-green-500 mb-2" size={32}/>
               <p className="text-green-800 font-medium">Email Sent!</p>
               <p className="text-green-600 text-sm mt-1">Please check your inbox for instructions.</p>
           </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded">{error}</div>}
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white py-2 rounded-lg hover:bg-green-700 flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin"/> : 'Send Reset Link'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;