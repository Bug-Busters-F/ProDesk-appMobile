export type NotificationType = 'ticket_open' | 'ticket_closed' | 'new_message' | 'access_request';

export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  chatId?: string;
  ticketId?: string;
  createdAt: string;
}
