import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 Simple + reliable base URL
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  "https://todo-list-backend-4li8.onrender.com/api";

// 🔍 Debug (REMOVE later after fixing)
console.log("ENV URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("BASE_URL:", BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // shorter timeout = faster retry handling
});

// 🔐 Attach token automatically
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ❌ Let errors pass through (no UI blocking here)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default apiClient;
