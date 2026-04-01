// src/api/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export const login = async (username: string, password: string) => {
  const data = await apiClient.post("/users/login", { username, password });

  if (!data?.token) {
    throw new Error("No token received from server");
  }

  // 🔥 Ensure storage completes BEFORE returning
  await AsyncStorage.setItem("token", data.token);

  if (data.user?._id) {
    await AsyncStorage.setItem("userId", data.user._id);
  }

  // 🔥 VERIFY token is actually stored (important for APK)
  const savedToken = await AsyncStorage.getItem("token");
  if (!savedToken) {
    throw new Error("Token was not saved properly");
  }

  return data;
};

export const register = async (
  email: string,
  username: string,
  password: string,
) => {
  const data = await apiClient.post("/users/register", {
    email,
    username,
    password,
  });

  if (!data?.token) {
    throw new Error("No token received from server");
  }

  await AsyncStorage.setItem("token", data.token);

  if (data.user?._id) {
    await AsyncStorage.setItem("userId", data.user._id);
  }

  return data;
};
