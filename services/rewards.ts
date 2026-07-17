import api from "./api";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

export interface RewardData {
  xp: number;
  level: number;
  xp_to_next_level: number;
  daily_streak: number;
  attendance_streak: number;
  task_streak: number;
  achievements: Achievement[];
  badges: Badge[];
  weekly_goals: { tasks: number; attendance_pct: number; study_hours: number };
  monthly_goals: { tasks: number; attendance_pct: number; study_hours: number };
  weekly_progress: { tasks_completed: number; attendance_pct: number; study_hours: number };
  monthly_progress: { tasks_completed: number; attendance_pct: number; study_hours: number };
  new_achievements: string[];
}

export async function getRewards(): Promise<RewardData> {
  const { data } = await api.get<RewardData>("/rewards/");
  return data;
}

export async function addXp(amount: number, reason: string): Promise<{ xp: number; level: number }> {
  const { data } = await api.post("/rewards/add-xp", { amount, reason });
  return data;
}
