import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed. You will receive a confirmation email shortly with all the details.
        </p>
        <div className="flex flex-col space-y-3">
            <Link to="/my-bookings" className="bg-primary text-white py-3 rounded-xl font-medium hover:bg-green-700">
                View My Bookings
            </Link>
            <Link to="/" className="text-gray-500 hover:text-gray-700 font-medium">
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;