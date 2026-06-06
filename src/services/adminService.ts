import api from './api';

export interface DashboardStats {
  totalUsers: number;
  userBreakdown: {
    tourist: number;
    farmer: number;
    guide: number;
    transport: number;
  };
  pendingVerifications: number;
  totalRevenue: number;
  activeActivities: number;
}

// Dashboard
export const getDashboardStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Verification
export const getPendingVerifications = async () => {
  const response = await api.get('/admin/verifications/pending');
  return response.data;
};

export const verifyProvider = async (providerId: string, data: { action: string, comments: string, providerType: string }) => {
  const response = await api.put(`/admin/verify/${providerId}`, data);
  return response.data;
};

// Category & Tags
export const createCategory = async (data: { categoryName: string, description: string, icon: string }) => {
  const response = await api.post('/admin/categories/create', data);
  return response.data;
};

export const createTag = async (data: { categoryId: string, tagName: string, description: string }) => {
  const response = await api.post('/admin/tags/create', data);
  return response.data;
};

export const getCategoriesAdmin = async () => {
  const response = await api.get('/admin/categories');
  return response.data;
};

// Reports
export const getRevenueReports = async (range = 'month') => {
    const response = await api.get(`/admin/reports/revenue?range=${range}`);
    return response.data;
};

export const getActivityRevenueDistribution = async () => {
    const response = await api.get('/admin/reports/activity-revenue');
    return response.data;
};

export const getBookingStats = async () => {
    const response = await api.get('/admin/reports/bookings');
    return response.data;
};

export const getProviderLeaderboard = async () => {
    const response = await api.get('/admin/reports/leaderboard');
    return response.data;
};

export const getGeographicStats = async () => {
    const response = await api.get('/admin/reports/geographic');
    return response.data;
};

export const getFinancialStats = async () => {
    const response = await api.get('/admin/reports/financial');
    return response.data;
};

export const getRevenueForecast = async () => {
    const response = await api.get('/admin/reports/forecast');
    return response.data;
};

export const getUserGrowth = async () => {
    const response = await api.get('/admin/reports/users');
    return response.data;
};

// Users
export const getAllUsers = async (search = '', role = 'farmer', page = 1) => {
    const response = await api.get(`/admin/users?search=${search}&role=${role}&page=${page}`);
    return response.data;
};

export const updateUserStatus = async (userId: string, status: string) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
};

// Logs
export const getAuditLogs = async () => {
    const response = await api.get('/admin/logs/audit');
    return response.data;
};

export const getSystemLogs = async () => {
    const response = await api.get('/admin/logs/system');
    return response.data;
};