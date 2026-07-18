
const API_BASE = "http://127.0.0.1:8000";

export interface LibraryDocument {
  id: number;
  title: string;
  author: string;
  department: string;
  year: number;
  type: string;
  fileName: string;
  fileSize: string;
  pages: number;
  keywords: string[];
  bookmarked: boolean;
}

export async function getDocuments(): Promise<LibraryDocument[]> {
  const response = await fetch(`${API_BASE}/documents/`, { headers: authHeaders() });

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return response.json();
}

export interface DashboardStats {
  total_documents: number
  books: number
  research_papers: number
  scanned_pdfs: number
  active_researchers: number
}

export interface DashboardProfile {
  name: string
  initials: string
  role: string
  documents_read: number
  conversations: number
  bookmarks: number
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getDashboardProfile(): Promise<DashboardProfile> {
  const res = await fetch(`${API_BASE}/dashboard/profile`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch profile")
  return res.json()
}

export async function getProfile(): Promise<DashboardProfile> {
  return getDashboardProfile()
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/dashboard/stats`, { headers: authHeaders() })

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }

  return response.json()
}

export async function uploadDocument(formData: FormData) {
  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

export async function login(username: string, password: string) {
  // Temporary login until backend authentication is implemented

  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    success: true,
    username,
  }
}

export interface RecentUpload {
  id: number
  title: string
  author: string
  type: string
  time: string
}

export async function getRecentUploads(): Promise<RecentUpload[]> {
  const response = await fetch(`${API_BASE}/dashboard/recent`, { headers: authHeaders() })

  if (!response.ok) {
    throw new Error("Failed to fetch recent uploads")
  }

  return response.json()
}

export async function getRecentlyViewed() {
  const res = await fetch(`${API_BASE}/dashboard/recently-viewed`)
  if (!res.ok) throw new Error("Failed to fetch recently viewed")
  return res.json()
}

export async function trackDocumentView(documentId: number) {
  await fetch(`${API_BASE}/dashboard/track-view/${documentId}`, { method: "POST" })
}

export async function getAiQuestionsToday() {
  const res = await fetch(`${API_BASE}/dashboard/ai-questions-today`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch AI questions")
  return res.json()
}

export async function getTrendingTopics() {
  const res = await fetch(`${API_BASE}/dashboard/trending`)
  if (!res.ok) throw new Error("Failed to fetch trending")
  return res.json()
}

export interface Recommendation {
  id: number
  title: string
  author: string
  department: string
  type: string
  year: number
  summary?: string
}

export interface ConversationSummary {
  id: number
  title: string
  preview: string
  date: string
}

export interface ChatMessageData {
  id: number
  role: 'user' | 'assistant'
  content: string
  citations: any[]
  timestamp: string
}

export interface ConversationDetail extends ConversationSummary {
  messages: ChatMessageData[]
}

export async function getConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_BASE}/conversations/`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

export async function createConversation(): Promise<ConversationSummary> {
  const res = await fetch(`${API_BASE}/conversations/`, { method: "POST", headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to create conversation")
  return res.json()
}

export async function getConversation(id: number): Promise<ConversationDetail> {
  const res = await fetch(`${API_BASE}/conversations/${id}`)
  if (!res.ok) throw new Error("Failed to fetch conversation")
  return res.json()
}

export async function updateConversation(id: number, body: { title?: string; preview?: string }) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to update conversation")
  return res.json()
}

export async function deleteConversation(id: number) {
  const res = await fetch(`${API_BASE}/conversations/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete conversation")
  return res.json()
}

export async function askQuestion(question: string, conversationId?: number | null) {
  const res = await fetch(`${API_BASE}/assistant/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      question,
      conversation_id: conversationId ?? null,
    }),
  })
  if (!res.ok) throw new Error("Failed to get answer")
  return res.json()
}

export interface SearchResult {
  id: number
  title: string
  author: string
}

export async function searchDocuments(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  const res = await fetch(`${API_BASE}/documents/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("Search failed")
  return res.json()
}

export async function toggleBookmark(documentId: number): Promise<{ bookmarked: boolean }> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/bookmark`, { method: "POST", headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to toggle bookmark")
  return res.json()
}

export async function getBookmarkedDocuments(): Promise<LibraryDocument[]> {
  const res = await fetch(`${API_BASE}/documents/bookmarked`, { headers: authHeaders() })
  if (!res.ok) throw new Error("Failed to fetch bookmarked documents")
  return res.json()
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const response = await fetch(`${API_BASE}/recommendations/`)

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations")
  }

  return response.json()
}