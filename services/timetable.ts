import api from "./api";

export interface TimetableEntry {
  id?: string;
  title: string;
  subject?: string;
  day_of_week: number;
  time: string;
  duration_minutes: number;
  reminder_before: number;
  location?: string;
  notes?: string;
}

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export async function listTimetable(): Promise<TimetableEntry[]> {
  const { data } = await api.get<TimetableEntry[]>("/timetable/");
  return data;
}

export async function createTimetable(
  payload: TimetableEntry
): Promise<TimetableEntry> {
  const { data } = await api.post<TimetableEntry>("/timetable/", payload);
  return data;
}

export async function updateTimetable(
  id: string,
  payload: Partial<TimetableEntry>
): Promise<TimetableEntry> {
  const { data } = await api.put<TimetableEntry>(`/timetable/${id}`, payload);
  return data;
}

export async function deleteTimetable(id: string): Promise<void> {
  await api.delete(`/timetable/${id}`);
}

export async function generateEvents(
  weeks: number = 4
): Promise<{ created: number; message: string }> {
  const { data } = await api.post(
    `/timetable/generate?weeks=${weeks}`
  );
  return data;
}
