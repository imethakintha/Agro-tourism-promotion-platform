import api from './api';

export const createActivity = async (data: any) => {
  const response = await api.post('/activities/create', data);
  return response.data;
};

export const getMyActivities = async () => {
  const response = await api.get('/activities/my-activities');
  return response.data;
};

export const getActivity = (id: string) => api.get(`/activities/${id}`);

// 2. Update Activity
export const updateActivity = (id: string, data: any) => api.put(`/activities/${id}`, data);

// export const updateActivity = async (activityId: string, data: any) => {
//   const response = await api.put(`/activities/${activityId}`, data);
//   return response.data;
// };

export const updateAvailability = async (activityId: string, data: { date: string, timeSlots: any[] }) => {
  const response = await api.put(`/activities/${activityId}/availability`, data);
  return response.data;
};

export const bulkUpdateAvailability = async (activityId: string, data: { startDate: string, endDate: string, daysOfWeek: number[], timeSlots: any[] }) => {
  const response = await api.put(`/activities/${activityId}/availability/bulk`, data);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/activities/categories');
  return response.data;
};

export const getTagsByCategory = async (categoryId: string) => {
  const response = await api.get(`/activities/tags/${categoryId}`);
  return response.data;
};
