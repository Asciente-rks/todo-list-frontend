// src/api/client.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// 🚨 Safe BASE_URL: fallback ensures app won't crash
const rawBaseUrl =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL_PLAIN || "").trim() ||
  "https://todo-list-backend-4li8.onrender.com/api"; // fallback if missing

export const BASE_URL = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

console.log("✅ BASE_URL:", BASE_URL);

// Core API request function
const apiRequest = async (path: string, options: RequestInit = {}) => {
  try {
    // Get token if it exists (login/register may not have a token yet)
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("🔓 No token (public request):", path);
    }

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const fullUrl = `${BASE_URL}/${cleanPath}`;

    console.log("➡️ API CALL:", fullUrl);

    // 🔥 Remove AbortController for Android APK stability
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const text = await res.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error("❌ API ERROR RESPONSE:", {
        url: fullUrl,
        status: res.status,
        data,
      });

      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    return data;
  } catch (err: any) {
    console.error("❌ FETCH FAILED:", {
      path,
      base: BASE_URL,
      message: err.message,
    });

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
