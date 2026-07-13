export type DocumentType =
  | 'Book'
  | 'Research Paper'
  | 'Technical Report'
  | 'Scanned PDF'

export interface LibraryDocument {
  id: string
  title: string
  author: string
  year: number
  department: string
  keywords: string[]
  type: DocumentType
  fileSize: string
  pages: number
  bookmarked: boolean
  abstract: string
}

export interface StatCard {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: string
}

export interface UploadRecord {
  id: string
  title: string
  type: DocumentType
  department: string
  date: string
  status: 'Completed' | 'Processing' | 'Failed'
  size: string
}

export interface Citation {
  id: string
  documentName: string
  page: number
  confidence: number
  reference: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: string
}

export interface Conversation {
  id: string
  title: string
  preview: string
  date: string
  messages: ChatMessage[]
}

export interface Recommendation {
  id: string
  title: string
  author: string
  summary: string
  score: number
  reason: string
  type: DocumentType
  department: string
}

export interface UserProfile {
  name: string
  role: string
  department: string
  email: string
  employeeId: string
  location: string
  joined: string
  avatarInitials: string
}
