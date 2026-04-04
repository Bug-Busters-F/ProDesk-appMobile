import { Ticket, TicketHistoryEntry } from '@/types/ticket';
import api from './api';

const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
    const response = await api.post('/tickets', data)
    return response.data
};

const fetchAllTickets = async (): Promise<Ticket[]> => {
    const response = await api.get('/tickets')
    return response.data
};

const fetchTicketByID = async (id: string): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
};

const fetchTicketHistory = async (id: string): Promise<TicketHistoryEntry[]> => {
    const response = await api.get(`/tickets/${id}/history`)
    return response.data
};

const deleteTicket = async (id: string): Promise<boolean> => {
    const response = await api.delete(`/tickets/${id}`)
    return response.data
};
