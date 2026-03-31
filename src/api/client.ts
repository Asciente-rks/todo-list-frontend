// src/client.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  "https://todo-list-backend-4li8.onrender.com/api";

// Debug
console.log("BASE_URL:", BASE_URL);

// Core request function
const apiRequest = async (
  path: string,
  options: RequestInit = {},
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`[API ERROR] ${path}:`, err.message);
    throw err;
  }
};

// Auth functions
export const login = async (username: string, password: string) => {
  const data = await apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (data.token) await AsyncStorage.setItem("token", data.token);
  if (data.user?._id) await AsyncStorage.setItem("userId", data.user._id);

  return data;
};

export const register = async (
  email: string,
  username: string,
  password: string,
) => {
  const data = await apiRequest("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password }),
  });

  if (data.token) await AsyncStorage.setItem("token", data.token);
  if (data.user?._id) await AsyncStorage.setItem("userId", data.user._id);

  return data;
};

// Generic API client
export const apiClient = {
  get: (path: string) => apiRequest(path, { method: "GET" }),
  post: (path: string, body: any) =>
    apiRequest(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path: string, body: any) =>
    apiRequest(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path: string, body: any) =>
    apiRequest(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => apiRequest(path, { method: "DELETE" }),
};

export default apiClient;
