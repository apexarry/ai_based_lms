/**
 * Placeholder API layer.
 *
 * These functions currently return mock data with a simulated network delay.
 * Swap the bodies for real `fetch` calls to the FastAPI backend later, e.g.:
 *
 *   const res = await fetch(`${API_BASE_URL}/documents`)
 *   return res.json()
 *
 * Endpoints map to: authentication, document uploads, AI chatbot, OCR,
 * semantic search, and the recommendation engine.
 */
import {
  documents,
  recommendations,
  conversations,
  uploadHistory,
  stats,
} from '@/lib/mock-data'
import type { Citation, LibraryDocument } from '@/types'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'

function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export async function login(username: string, _password: string) {
  // TODO: POST `${API_BASE_URL}/auth/login`
  return delay({ token: 'demo-token', username }, 700)
}

export async function fetchStats() {
  // TODO: GET `${API_BASE_URL}/dashboard/stats`
  return delay(stats)
}

export async function fetchDocuments(): Promise<LibraryDocument[]> {
  // TODO: GET `${API_BASE_URL}/documents` (supports semantic search + filters)
  return delay(documents)
}

export async function uploadDocument(_formData: FormData) {
  // TODO: POST `${API_BASE_URL}/documents` (multipart, triggers OCR pipeline)
  return delay({ success: true })
}

export async function fetchUploadHistory() {
  // TODO: GET `${API_BASE_URL}/documents/uploads`
  return delay(uploadHistory)
}

export async function fetchRecommendations() {
  // TODO: GET `${API_BASE_URL}/recommendations`
  return delay(recommendations)
}

export async function fetchConversations() {
  // TODO: GET `${API_BASE_URL}/assistant/conversations`
  return delay(conversations)
}

export interface AssistantReply {
  content: string
  citations: Citation[]
}

export async function askAssistant(_prompt: string): Promise<AssistantReply> {
  // TODO: POST `${API_BASE_URL}/assistant/ask` (RAG over the semantic index)
  const reply: AssistantReply = {
    content:
      'Based on the indexed defence research corpus, here is a synthesised answer drawing on the most relevant sources. Adaptive signal processing techniques such as STAP and RLS beamforming provide strong clutter and interference suppression, while sensor-fusion navigation frameworks combine visual-inertial odometry with terrain matching for resilient GPS-denied operation. The referenced documents below were ranked highest by the semantic retriever.',
    citations: [
      { id: 'g1', documentName: 'Advanced Radar Signal Processing for Target Detection', page: 12, confidence: 0.94, reference: 'Ramachandran, A. (2024)' },
      { id: 'g2', documentName: 'Autonomous UAV Navigation in GPS-Denied Environments', page: 21, confidence: 0.87, reference: 'Nair, P. (2024)' },
    ],
  }
  return delay(reply, 1400)
}
