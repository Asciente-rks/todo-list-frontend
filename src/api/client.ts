import AsyncStorage from "@react-native-async-storage/async-storage";

// Base URL (fallback if env not set)
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  "https://todo-list-backend-4li8.onrender.com/api";

console.log("[API BASE_URL]", BASE_URL);

// Core API request function
export const apiRequest = async (
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

// Generic API client for convenience
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
