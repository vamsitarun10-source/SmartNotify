import api from "./api";
import type { ClassEvent } from "./events";

export interface AIChatResponse {
  event: ClassEvent | null;
  events: ClassEvent[] | null;
  action: string;
  reply: string;
}

export async function chat(message: string): Promise<AIChatResponse> {
  const { data } = await api.post<AIChatResponse>("/ai/chat", { message });
  return data;
}
