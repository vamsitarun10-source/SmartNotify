import api from "./api";

export interface DashboardStats {
  attendance: {
    total: number;
    attended: number;
    missed: number;
    unmarked: number;
    percentage: number;
    can_skip: number;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
  };
  assignments: {
    total: number;
    completed: number;
  };
  exams: {
    total: number;
    completed: number;
    upcoming: number;
  };
  productivity: number;
  study_hours: number;
  weekly: {
    classes: number[];
    tasks: number[];
  };
  monthly: {
    classes_total: number;
    classes_attended: number;
    tasks_completed: number;
    assignments_completed: number;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/stats/dashboard");
  return data;
}
