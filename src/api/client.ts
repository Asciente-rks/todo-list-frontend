// src/api/client.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🚨 FORCE env usage
const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!rawBaseUrl) {
  throw new Error(
    "❌ EXPO_PUBLIC_API_URL is not defined. Check eas.json env config.",
  );
}

// Ensure no trailing slash
export const BASE_URL = rawBaseUrl.endsWith("/")
  ? rawBaseUrl.slice(0, -1)
  : rawBaseUrl;

console.log("✅ BASE_URL:", BASE_URL);

// Core API request function
const apiRequest = async (path: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    // 🔥 CRITICAL FIX: retry token (APK timing issue)
    let token = await AsyncStorage.getItem("token");

    if (!token) {
      await new Promise((res) => setTimeout(res, 200));
      token = await AsyncStorage.getItem("token");
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found for request:", path);
    }

    // Clean URL
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
      console.error("❌ API ERROR RESPONSE:", {
        url: fullUrl,
        status: res.status,
        data,
      });

      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);

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
    apiRequest(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (path: string, body: any) =>
    apiRequest(path, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: (path: string, body: any) =>
    apiRequest(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (path: string) => apiRequest(path, { method: "DELETE" }),
};

export default apiClient;
