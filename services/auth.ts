import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import { secureSetItem, secureGetItem, secureRemoveItem } from "./encryption";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  await secureSetItem(TOKEN_KEY, data.token);
  await secureSetItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  await secureSetItem(TOKEN_KEY, data.token);
  await secureSetItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function logout(): Promise<void> {
  await secureRemoveItem(TOKEN_KEY);
  await secureRemoveItem(USER_KEY);
}

export async function getToken(): Promise<string | null> {
  const token = await secureGetItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    await secureRemoveItem(TOKEN_KEY);
    await secureRemoveItem(USER_KEY);
    return null;
  }
  return token;
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await secureGetItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    await secureRemoveItem(USER_KEY);
    return null;
  }
}
