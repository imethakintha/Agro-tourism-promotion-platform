import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../services/paymentService';
import { Loader2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Use public key from env or a placeholder for development
const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const CheckoutForm: React.FC<{ bookingId: string, amount: number, onSuccess: () => void }> = ({ bookingId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Create Intent on Backend
      const { clientSecret, paymentId } = await createPaymentIntent(bookingId);

      // 2. Confirm Card Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // 3. Notify Backend to Confirm
          await confirmPayment(result.paymentIntent.id);
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment initialization failed');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-xl font-bold text-gray-800">LKR {amount}</span>
        </div>
        <div className="text-xs text-gray-500 flex items-center">
            <Lock size={12} className="mr-1"/> Secure 256-bit SSL Encrypted payment
        </div>
      </div>

      <div className="border p-3 rounded-md bg-white">
        <CardElement options={{
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                },
            },
        }}/>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex justify-center items-center"
      >
        {processing ? <Loader2 className="animate-spin"/> : `Pay LKR ${amount}`}
      </button>
    </form>
  );
};

const PaymentForm: React.FC<{ bookingId: string, amount: number }> = ({ bookingId, amount }) => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Payment</h2>
            <Elements stripe={stripePromise}>
                <CheckoutForm 
                    bookingId={bookingId} 
                    amount={amount} 
                    onSuccess={() => navigate('/payment/success')} 
                />
            </Elements>
            <button onClick={() => navigate('/my-bookings')} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">Close</button>
        </div>
    </div>
  );
};

export default PaymentForm;