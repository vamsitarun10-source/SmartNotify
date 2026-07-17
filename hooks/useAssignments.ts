import { createCrudHook } from "./useCrudHook";
import {
  listAssignments as apiList,
  createAssignment as apiCreate,
  updateAssignment as apiUpdate,
  deleteAssignment as apiDelete,
  toggleAssignment as apiToggle,
  getUpcomingAssignments,
  type Assignment,
} from "../services/assignments";
import { useState, useEffect, useCallback } from "react";

const service = {
  list: apiList,
  create: apiCreate,
  update: apiUpdate,
  remove: apiDelete,
  toggle: apiToggle,
};

export const useAssignments = createCrudHook<Assignment>(service, "cache_assignments");

export function useUpcomingAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUpcomingAssignments();
      setAssignments(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assignments, loading, refresh };
}
