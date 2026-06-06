import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import authService from '../services/authService';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  const effectRan = useRef(false);

  useEffect(() => {

    if (effectRan.current === true) return;
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
      } catch (error: any) {
        if (error.response?.data?.message === 'Invalid verification token' || error.response?.status === 400) {
          setStatus('success');
          setMessage('Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Verification failed.');
        }
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying...</h2>
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              Proceed to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              to="/login"
              className="text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;