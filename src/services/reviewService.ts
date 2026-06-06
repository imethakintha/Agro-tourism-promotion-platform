import api from './api';

export const createReview = async (data: any) => {
  const response = await api.post('/reviews/create', data);
  return response.data;
};

export const getReviewsByTarget = async (targetId: string) => {
  const response = await api.get(`/reviews/target/${targetId}`);
  return response.data;
};

// Admin
export const getPendingReviews = async () => {
    const response = await api.get('/admin/reviews/pending');
    return response.data;
};

export const moderateReview = async (reviewId: string, status: 'Approved' | 'Rejected') => {
    const response = await api.put(`/admin/reviews/${reviewId}/moderate`, { status });
    return response.data;
};

// Feedback
export const submitFeedback = async (data: any) => {
    const response = await api.post('/feedback', data);
    return response.data;
};

export const getAllFeedback = async () => {
    const response = await api.get('/feedback/admin/all');
    return response.data;
};