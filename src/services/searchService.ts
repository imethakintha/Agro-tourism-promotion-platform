import api from './api';

export interface SearchParams {
  q?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: string;
  page?: number;
}

export const searchActivities = async (params: SearchParams) => {
  const response = await api.get('/search/activities', { params });
  return response.data;
};

export const getSuggestions = async (query: string) => {
  const response = await api.get(`/search/suggestions?q=${query}`);
  return response.data;
};

export const getActivityDetails = async (activityId: string) => {
  const response = await api.get(`/activities/details/${activityId}`);
  return response.data;
};

export const getFarmPublicProfile = async (farmId: string) => {
  const response = await api.get(`/search/farms/${farmId}`);
  return response.data;
};

// අලුත් function එකක් එකතු කරන්න
export const geocodeLocation = async (address: string) => {
  // අපි තාවකාලිකව backend එකේ farm registration එකට පාවිච්චි කරපු logic එකම පාවිච්චි කරමු 
  // නැත්නම් කෙලින්ම public endpoint එකක් හදන්න වෙනවා.
  // දැනට backend එකේ /api/public/geocode කියලා අලුත් endpoint එකක් හදමු (ඊළඟ පියවරේදී).
  const response = await api.get(`/public/geocode?address=${encodeURIComponent(address)}`);
  return response.data;
};