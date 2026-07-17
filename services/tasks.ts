import api from "./api";

export interface Task {
  id?: string;
  title: string;
  priority: string;
  due_date: string;
  due_time: string;
  reminder_minutes: number;
  category: string;
  notes: string;
  completed: boolean;
  created_at?: string;
}

export async function listTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks/");
  return data;
}

export async function getTodayTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>("/tasks/today");
  return data;
}

export async function createTask(payload: Task): Promise<Task> {
  const { data } = await api.post<Task>("/tasks/", payload);
  return data;
}

export async function updateTask(
  id: string,
  payload: Partial<Task>
): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleTask(id: string): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}/toggle`);
  return data;
}
