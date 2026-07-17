import api from "./api";

export interface Assignment {
  id?: string;
  title: string;
  subject: string;
  due_date: string;
  due_time: string;
  priority: string;
  notes: string;
  attachment: string;
  reminder_minutes: number;
  completed: boolean;
  created_at?: string;
}

export async function listAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>("/assignments/");
  return data || [];
}

export async function getTodayAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>("/assignments/today");
  return data;
}

export async function getUpcomingAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<Assignment[]>("/assignments/upcoming");
  return data;
}

export async function createAssignment(payload: Assignment): Promise<Assignment> {
  const { data } = await api.post<Assignment>("/assignments/", payload);
  return data;
}

export async function updateAssignment(
  id: string,
  payload: Partial<Assignment>
): Promise<Assignment> {
  const { data } = await api.put<Assignment>(`/assignments/${id}`, payload);
  return data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export async function toggleAssignment(id: string): Promise<Assignment> {
  const { data } = await api.put<Assignment>(`/assignments/${id}/toggle`);
  return data;
}
