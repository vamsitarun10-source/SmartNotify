import api from "./api";

export interface CrudApi<T> {
  endpoint: string;
  listParams?: Record<string, string>;
}

export function createCrudService<T>(config: CrudApi<T>) {
  return {
    list: async (params?: Record<string, string>): Promise<T[]> => {
      const { data } = await api.get<T[]>(config.endpoint, { params: { ...config.listParams, ...params } });
      return data;
    },
    create: async (payload: Partial<T>): Promise<T> => {
      const { data } = await api.post<T>(config.endpoint, payload);
      return data;
    },
    update: async (id: string, payload: Partial<T>): Promise<T> => {
      const { data } = await api.put<T>(`${config.endpoint}${id}`, payload);
      return data;
    },
    remove: async (id: string): Promise<void> => {
      await api.delete(`${config.endpoint}${id}`);
    },
    toggle: config.endpoint.includes("/exams/") || config.endpoint.includes("/tasks/") || config.endpoint.includes("/assignments/") || config.endpoint.includes("/notes/")
      ? async (id: string): Promise<T> => {
          const { data } = await api.put<T>(`${config.endpoint}${id}/toggle`);
          return data;
        }
      : undefined,
  };
}
