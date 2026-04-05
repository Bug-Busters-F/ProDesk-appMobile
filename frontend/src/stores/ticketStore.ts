import { createTicket, deleteTicket, fetchAllTickets, fetchTicketByID } from "@/services/ticketApi";
import { Ticket } from "@/types/ticket"
import { create } from 'zustand';

enum TicketErrors {
    "CREATE_TICKET_ERROR" = "Error ao criar novo chamado",
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
    createNewTicket: (data: any) => Promise<void>;
    fetchTickets: () => Promise<void>;
    fetchTicketById: (id: string) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
}

type TicketStore = States & Actions

export const useTicketStore = create<TicketStore>((set, get) => ({
    tickets: [],
    selectedTicket: null,
    error: null,
    loading: true,

    createNewTicket: async (data: any): Promise<void> => {
        try {
            const createdTicket = await createTicket(data)
            console.log('createdTicket', createdTicket)
            const foundedCreated = await fetchTicketByID(createdTicket._id)
            
            set((state) => ({
            tickets: [foundedCreated, ...state.tickets]
            }))
        } catch (e) {
            set({error: TicketErrors.CREATE_TICKET_ERROR})
            console.error(e)
        }
    },

    fetchTickets: async () => {
        try{
            const tickets = await fetchAllTickets()
            set({ tickets })
        } catch (e) {
            set({error: TicketErrors.FETCH_ALL_ERROR})
            console.error(e)
        } finally {
            set({loading: false})
        }
    },

    fetchTicketById: async (id: string) => {
        try{
            const selectedTicket = await fetchTicketByID(id)
            set({ selectedTicket })
        } catch(e) {
            set({error: `${TicketErrors.FETCH_BY_ID_ERROR} ${id}`})
            console.error(e)
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