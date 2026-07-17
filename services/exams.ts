import api from "./api";

export interface Exam {
  id?: string;
  title: string;
  subject: string;
  exam_type: string;
  date: string;
  time: string;
  duration_minutes: number;
  location: string;
  notes: string;
  reminder_minutes: number;
  completed: boolean;
  created_at?: string;
}

export async function listExams(): Promise<Exam[]> {
  const { data } = await api.get<Exam[]>("/exams/");
  return data;
}

export async function getUpcomingExams(): Promise<Exam[]> {
  const { data } = await api.get<Exam[]>("/exams/upcoming");
  return data;
}

export async function createExam(payload: Exam): Promise<Exam> {
  const { data } = await api.post<Exam>("/exams/", payload);
  return data;
}

export async function updateExam(id: string, payload: Partial<Exam>): Promise<Exam> {
  const { data } = await api.put<Exam>(`/exams/${id}`, payload);
  return data;
}

export async function deleteExam(id: string): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export async function toggleExam(id: string): Promise<Exam> {
  const { data } = await api.put<Exam>(`/exams/${id}/toggle`);
  return data;
}
