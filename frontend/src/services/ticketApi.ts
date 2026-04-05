import { Ticket, TicketHistoryEntry } from '@/types/ticket';
import api from './api';

export const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.post('/tickets', data)
    return response.data
};

export const fetchAllTickets = async (): Promise<Ticket[]> => {
    console.log('chamado')
    console.log(api.getUri())
    const response = await api.get('/tickets')
    return response.data
};

export const fetchTicketByID = async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
};

export const fetchTicketHistory = async (id: string): Promise<TicketHistoryEntry[]> => {
    const response = await api.get(`/tickets/${id}/history`)
    return response.data
};

export const deleteTicket = async (id: string): Promise<boolean> => {
    const response = await api.delete(`/tickets/${id}`)
    return response.data
};
