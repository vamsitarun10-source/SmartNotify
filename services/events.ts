import api from "./api";

export interface ClassEvent {
  id?: string;
  title: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reminder_before: number; // minutes
  location?: string;
  notes?: string;
  attended?: boolean | null;
  duration_minutes?: number | null;
}

export async function listEvents(): Promise<ClassEvent[]> {
  const { data } = await api.get<ClassEvent[]>("/events");
  return data || [];
}

export async function createEvent(payload: ClassEvent): Promise<ClassEvent> {
  const { data } = await api.post<ClassEvent>("/events", payload);
  return data;
}

export async function updateEvent(
  id: string,
  payload: Partial<ClassEvent>
): Promise<ClassEvent> {
  const { data } = await api.put<ClassEvent>(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}

export async function markAttendance(
  id: string,
  attended: boolean
): Promise<ClassEvent> {
  const { data } = await api.put<ClassEvent>(`/events/${id}/attendance`, { attended });
  return data;
}

export interface AttendanceSummary {
  title: string;
  total: number;
  attended: number;
  missed: number;
  unmarked: number;
  percentage: number;
  can_skip: number;
}

export async function getAttendanceSummary(): Promise<AttendanceSummary[]> {
  const { data } = await api.get<AttendanceSummary[]>("/events/attendance/summary");
  return data;
}
