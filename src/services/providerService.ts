import api from './api';

// Farmer
export const registerFarm = async (data: any) => {
  const response = await api.post('/farmers/register-farm', data);
  return response.data;
};

export const getMyFarm = async () => {
  const response = await api.get('/farmers/my-farm');
  return response.data;
};

export const updateFarmDetails = async (data: any) => {
  const response = await api.put('/farmers/update-farm', data);
  return response.data;
};

// Guide
export const registerGuide = async (data: any) => {
  const response = await api.post('/guides/register', data);
  return response.data;
};

export const getGuideProfile = async () => {
  const response = await api.get('/guides/profile');
  return response.data;
};

export const getGuideRequests = async () => {
    const response = await api.get('/guides/requests');
    return response.data;
};

export const respondGuideRequest = async (bookingId: string, action: 'Accept' | 'Decline') => {
    const response = await api.put(`/guides/requests/${bookingId}/respond`, { action });
    return response.data;
};

// Transport
export const registerTransport = async (data: any) => {
  const response = await api.post('/transport/register', data);
  return response.data;
};

export const getTransportProfile = async () => {
  const response = await api.get('/transport/profile');
  return response.data;
};

export const getTransportRequests = async () => {
    const response = await api.get('/transport/requests');
    return response.data;
};

export const respondTransportRequest = async (bookingId: string, action: 'Accept' | 'Decline') => {
    const response = await api.put(`/transport/requests/${bookingId}/respond`, { action });
    return response.data;
};

// Helper to upload multiple documents/images
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePic', file); // Using the same endpoint for simplicity, but in real app should be generic upload
    const response = await api.post('/users/upload-profile-pic', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.profilePicUrl;
};

export const getGuideJobs = async () => {
    const response = await api.get('/guides/jobs');
    return response.data;
};

export const getTransportJobs = async () => {
    const response = await api.get('/transport/jobs');
    return response.data;
};