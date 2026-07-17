import { createCrudHook } from "./useCrudHook";
import {
  listTasks as apiList,
  createTask as apiCreate,
  updateTask as apiUpdate,
  deleteTask as apiDelete,
  toggleTask as apiToggle,
  getTodayTasks,
  type Task,
} from "../services/tasks";
import { useState, useEffect, useCallback } from "react";

const taskService = {
  list: apiList,
  create: apiCreate,
  update: apiUpdate,
  remove: apiDelete,
  toggle: apiToggle,
};

export const useTasks = createCrudHook<Task>(taskService, "cache_tasks");

export function useTodayTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTodayTasks();
      setTasks(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tasks, loading, refresh };
}
