import api from './api';

export const createTicket = async (data: any) => {
    const response = await api.post('/support/create', data);
    return response.data;
};

export const getUserTickets = async () => {
    const response = await api.get('/support/my-tickets');
    return response.data;
};

export const getTicketDetails = async (ticketId: string) => {
    const response = await api.get(`/support/${ticketId}`);
    return response.data;
};

export const replyToTicket = async (ticketId: string, message: string) => {
    const response = await api.post(`/support/${ticketId}/reply`, { message });
    return response.data;
};

// Admin
export const getAllTickets = async () => {
    const response = await api.get('/support/admin/all');
    return response.data;
};

export const updateTicketStatus = async (ticketId: string, status: string) => {
    const response = await api.put(`/support/admin/${ticketId}/status`, { status });
    return response.data;
};