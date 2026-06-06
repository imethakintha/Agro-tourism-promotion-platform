import api from './api';

// Types for requests
export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  countryOfResidence?: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Auth Service functions
const register = async (userData: RegisterData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

const login = async (userData: LoginData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

const verifyEmail = async (token: string) => {
  const response = await api.post(`/auth/verify-email/${token}`);
  return response.data;
};

const updateProfile = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

const uploadProfilePic = async (formData: FormData) => {
  const response = await api.post('/users/upload-profile-pic', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const deleteAccount = async (password: string) => {
  const response = await api.delete('/users/account', {
    data: { password }
  });
  return response.data;
};

const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

const resetPassword = async (token: string, password: string) => {
  const response = await api.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

const authService = {
  register,
  login,
  verifyEmail,
  updateProfile,
  uploadProfilePic,
  deleteAccount,
  forgotPassword,
  resetPassword
};

export default authService;