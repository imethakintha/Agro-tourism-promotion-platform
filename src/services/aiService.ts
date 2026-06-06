import api from './api';

export const identifyPlant = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/ai/identify-plant', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const sendChatMessage = async (message: string, sessionId?: string, context?: any) => {
  const response = await api.post('/ai/chatbot', { message, sessionId, context });
  return response.data;
};

export const getChatHistory = async (sessionId: string) => {
  const response = await api.get(`/ai/conversation-history/${sessionId}`);
  return response.data;
};

export const getAIRecommendations = async () => {
  const response = await api.get('/ai/recommendations');
  return response.data;
};

export const checkLanguageSupport = async (lat: number, lng: number, language: string) => {
  const response = await api.post('/ai/predict-language', { lat, lng, language });
  return response.data;
};

export const getAgroWisdom = async (query: string) => {
  const response = await api.post('/ai/agro-guide', { query });
  return response.data;
};

export const getSmartPricePrediction = (data: { categoryId: string; tagIds: string[]; currentPrice?: number }) => {
    return api.post('/ai/smart-price', data);
};