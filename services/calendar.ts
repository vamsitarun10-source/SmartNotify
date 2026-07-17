import api from "./api";

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string;
  category: string;
  notes: string;
  created_at?: string;
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  const { data } = await api.get<CalendarEvent[]>("/calendar/");
  return data;
}

export async function createCalendarEvent(payload: CalendarEvent): Promise<CalendarEvent> {
  const { data } = await api.post<CalendarEvent>("/calendar/", payload);
  return data;
}

export async function updateCalendarEvent(id: string, payload: Partial<CalendarEvent>): Promise<CalendarEvent> {
  const { data } = await api.put<CalendarEvent>(`/calendar/${id}`, payload);
  return data;
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await api.delete(`/calendar/${id}`);
}
