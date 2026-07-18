import { createCrudHook } from "./useCrudHook";
import {
  listExams as apiList,
  createExam as apiCreate,
  updateExam as apiUpdate,
  deleteExam as apiDelete,
  toggleExam as apiToggle,
  getUpcomingExams,
  type Exam,
} from "../services/exams";
import { useState, useEffect, useCallback } from "react";

const service = {
  list: apiList,
  create: apiCreate,
  update: apiUpdate,
  remove: apiDelete,
  toggle: apiToggle,
};

export const useExams = createCrudHook<Exam>(service, "cache_exams", "exams");

export function useUpcomingExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUpcomingExams();
      setExams(data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { exams, loading, refresh };
}
