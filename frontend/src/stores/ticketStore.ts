import { deleteTicket, fetchAllTickets, fetchTicketByID } from "@/services/ticketApi";
import { Ticket } from "@/types/ticket"
import { create } from 'zustand';

enum TicketErrors {
    "FETCH_ALL_ERROR" = "Erro ao carregar chamados",
    "FETCH_BY_ID_ERROR" = "Erro ao carregar chamado com o id:"
}

type States = {
    selectedTicket: Ticket | null
    tickets: Ticket[]
    error: string | null
    loading: boolean
}

type Actions = {
    // createNewTicket: (data) => Promise<Ticket>
    fetchTickets: () => void;
    fetchTicketById: (id: string) => void;
    deleteTicket: (id: string) => void;
}

type TicketStore = States & Actions

export const useTicketStore = create<TicketStore>((set, get) => ({
    tickets: [],
    selectedTicket: null,
    error: null,
    loading: true,
    // createNewTicket: async (data) => {

    // };

    fetchTickets: async () => {
        try{
            const tickets = await fetchAllTickets()
            set({ tickets })
        } catch {
            set({error: TicketErrors.FETCH_ALL_ERROR})
        } finally {
            set({loading: false})
        }
    },

    fetchTicketById: async (id: string) => {
        try{
            const selectedTicket = await fetchTicketByID(id)
            set({ selectedTicket })
        } catch {
            set({error: `${TicketErrors.FETCH_BY_ID_ERROR} ${id}`})
        }
    },

    deleteTicket: async (id: string) => {
        try {
            await deleteTicket(id);
            
            const tickets = get().tickets.filter((t) => t.id !== id)

            set({ selectedTicket: null, tickets})
        } catch (error) {
            
        }
    },
}))