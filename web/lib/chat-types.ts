export interface ChatListItem {
  id: number
  to: string
  last_message: string
  last_message_date: string | null
  readed: boolean
}

export interface ChatListResult {
  docs: ChatListItem[]
  page: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ConversationMessage {
  id: number
  content: string
  createdAt: string
  isOwn: boolean
  senderName: string
  readByOther: boolean
}

export interface ConversationResult {
  id: number
  title: string
  messages: ConversationMessage[]
  olderCursor: number | null
}
