import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Base URL safe fallback
const rawBaseUrl =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_PLAIN || "").trim() ||
  "https://todo-list-backend-4li8.onrender.com/api";

export const BASE_URL = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

console.log("✅ BASE_URL:", BASE_URL);

// Helper: wait for token, but avoid infinite loop in build
const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch {
    return null;
  }
};

// Core API request
const apiRequest = async (path: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout

  try {
    const token = await getToken();

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const fullUrl = `${BASE_URL}/${cleanPath}`;
    console.log("➡️ API CALL:", fullUrl);

    const res = await fetch(fullUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      // Attach status so our retry wrapper knows if this is a validation error (400)
      const error: any = new Error(
        data?.error || data?.message || `HTTP ${res.status}`,
      );
      error.status = res.status;
      throw error;
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Only log as a "failure" if it's a network/timeout issue.
    // 400/401 errors are normal validation and don't need a scary red log.
    if (!err.status) {
      console.error("❌ NETWORK FAILURE:", {
        path,
        message: err.message,
      });
    }
    throw err;
  }
};

// API wrapper
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
