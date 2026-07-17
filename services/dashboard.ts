import api from "./api";

export interface DashboardData {
  attendance: {
    subjects: { name: string; attended: number; missed: number; unmarked: number; total: number; pct: number }[];
    total_attended: number;
    total_missed: number;
    overall_pct: number;
  };
  productivity: {
    tasks_completed: number;
    tasks_total: number;
    assignments_completed: number;
    assignments_total: number;
  };
  exams_this_week: { id: string; title: string; subject: string; date: string; time: string; exam_type: string; location: string }[];
  upcoming_assignments: { id: string; title: string; subject: string; due_date: string; priority: string; attachment: string }[];
  recent_notes: { id: string; title: string; subject: string; note_type: string; preview: string }[];
  free_periods: { start: string; end: string }[];
  free_periods_count: number;
  study_hours: number;
  suggestions: { icon: string; text: string; color: string }[];
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/dashboard/");
  return data;
}
