import api from "./api";

export interface NoteAttachment {
  filename: string;
  type: string;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  subject: string;
  note_type: string;
  attachments: NoteAttachment[];
  pinned: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function listNotes(q?: string, subject?: string): Promise<Note[]> {
  const params: Record<string, string> = {};
  if (q) params.q = q;
  if (subject) params.subject = subject;
  const { data } = await api.get<Note[]>("/notes/", { params });
  return data;
}

export async function getNoteSubjects(): Promise<string[]> {
  const { data } = await api.get<string[]>("/notes/subjects");
  return data;
}

export async function createNote(payload: Note): Promise<Note> {
  const { data } = await api.post<Note>("/notes/", payload);
  return data;
}

export async function updateNote(id: string, payload: Partial<Note>): Promise<Note> {
  const { data } = await api.put<Note>(`/notes/${id}`, payload);
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}

export async function togglePin(id: string): Promise<Note> {
  const { data } = await api.put<Note>(`/notes/${id}/pin`);
  return data;
}
