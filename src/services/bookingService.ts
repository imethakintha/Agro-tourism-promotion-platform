import api from './api';

export const checkAvailability = async (data: { activityId: string, date: string, participants: number }) => {
  const response = await api.post('/bookings/check-availability', data);
  return response.data;
};

export const createBooking = async (data: any) => {
  const response = await api.post('/bookings/create', data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my-bookings');
  return response.data;
};

export const getBookingDetails = async (bookingId: string) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId: string, reason: string) => {
  const response = await api.put(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

export const updateBookingStatus = async (bookingId: string, status: 'Confirmed' | 'Declined' | 'Completed', reason?: string) => {
  const response = await api.put(`/farmers/booking/${bookingId}/status`, { status, reason });
  return response.data;
};

export const getTransportCost = async (activityId: string, pickupAddress: string) => {
  const response = await api.post('/bookings/estimate-transport', { activityId, pickupAddress });
  return response.data;
};