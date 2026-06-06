import api from './api';

export const createPaymentIntent = async (bookingId: string) => {
  const response = await api.post('/payments/create-intent', { bookingId });
  return response.data;
};

export const confirmPayment = async (paymentIntentId: string) => {
  const response = await api.post('/payments/confirm', { paymentIntentId });
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await api.get('/payments/history');
  return response.data;
};

// Payouts
export const getProviderEarnings = async () => {
    const response = await api.get('/payouts/earnings');
    return response.data;
};

export const getAllPayouts = async () => {
    const response = await api.get('/payouts');
    return response.data;
};

export const processPayout = async (payoutId: string) => {
    const response = await api.put(`/payouts/${payoutId}/process`);
    return response.data;
};