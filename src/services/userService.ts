import api from './api';

export const addFavorite = async (activityId: string) => {
  const response = await api.post('/favorites/add', { activityId });
  return response.data;
};

export const removeFavorite = async (activityId: string) => {
  const response = await api.delete(`/favorites/remove/${activityId}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get('/favorites/list');
  return response.data;
};