import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// We check for the string "undefined" because build-time injection
// can sometimes replace variables with that literal string in minified code.
const envUrl = process.env.EXPO_PUBLIC_API_URL;

let cleanUrl =
  envUrl &&
  envUrl !== "undefined" &&
  envUrl !== "null" &&
  envUrl.startsWith("http")
    ? envUrl
    : "https://todo-list-backend-4li8.onrender.com/api";

cleanUrl = cleanUrl.trim();
// Ensure the URL ends with /api once and only once
if (!cleanUrl.endsWith("/api")) {
  cleanUrl = cleanUrl.replace(/\/$/, "") + "/api";
}

const BASE_URL = cleanUrl;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000, // 60s is necessary for Render cold starts
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the calling function handle the error.
    // Removing the Alert here prevents UI blocks during the auth flow.
    return Promise.reject(error);
  },
);

export default apiClient;
