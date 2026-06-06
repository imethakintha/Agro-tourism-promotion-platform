import api from './api';

export const getPublicStats = async () => {
  const response = await api.get('/public/statistics');
  return response.data;
};

export const getExchangeRates = async () => {
  const response = await api.get('/public/rates');
  return response.data;
};

export const validatePromotion = async (code: string, amount: number) => {
    const response = await api.post('/promotions/validate', { code, amount });
    return response.data;
};