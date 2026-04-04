export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketCategory = 'WEB_APP' | 'ARTIFICIAL_INTELLIGENCE' | 'BUSINESS_INTELLIGENCE' | 'INTERNET_OF_THINGS' | 'OTHER'

export type TicketHistoryEntry = {
    event: string
    responsibleAgent: string | null
    status: TicketStatus
    message: string
    solution?: string | null
    occurredAt: Date
}

export type Ticket = {
    id: string
    title: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    category: TicketCategory
    clientId: string
    agentId?: string | null
    groupId?: string | null
    filesUrls?: string[]
    escalationLevel: number
    history: TicketHistoryEntry[]
    createdAt: Date
    updatedAt?: Date | null
    closedAt?: Date | null
}