import API from './api';

// Submit Feedback (User)
export const submitFeedback = (data: any) => API.post('/feedback', data);

// Get All Feedbacks (Admin)
export const getAllFeedbacks = () => API.get('/feedback');

// Update Status (Admin)
export const updateFeedbackStatus = (id: string, data: { status: string, adminNote?: string }) => 
    API.put(`/feedback/${id}`, data);

// Delete Feedback (Admin)
export const deleteFeedback = (id: string) => API.delete(`/feedback/${id}`);