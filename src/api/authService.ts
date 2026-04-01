// src/api/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";
import { retryUntilSuccess } from "./retryWrapper";

export const login = async (username: string, password: string) => {
  return retryUntilSuccess(async () => {
    const data = await apiClient.post("/users/login", { username, password });

    if (!data?.token) {
      throw new Error("No token received from server");
    }

    // Ensure storage completes BEFORE returning
    await AsyncStorage.setItem("token", data.token);

    const userId = data.user?.id || data.user?._id;
    if (userId) {
      await AsyncStorage.setItem("userId", userId);
    }

    // VERIFY token is actually stored (important for APK)
    const savedToken = await AsyncStorage.getItem("token");
    if (!savedToken) {
      throw new Error("Token was not saved properly");
    }

    return data;
  });
};

export const register = async (
  email: string,
  username: string,
  password: string,
) => {
  return retryUntilSuccess(async () => {
    const data = await apiClient.post("/users/register", {
      email,
      username,
      password,
    });

    if (!data?.token) {
      throw new Error("No token received from server");
    }

    await AsyncStorage.setItem("token", data.token);

    const userId = data.user?.id || data.user?._id;
    if (userId) {
      await AsyncStorage.setItem("userId", userId);
    }

    return data;
  });
};
