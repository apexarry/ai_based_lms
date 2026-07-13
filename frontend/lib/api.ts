
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
  const response = await fetch(`${API_BASE}/documents/`);

  if (!response.ok) {
    throw new Error("Failed to fetch documents");
  }

  return response.json();
}

export async function uploadDocument(formData: FormData) {
  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
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