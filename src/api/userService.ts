// src/api/userService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Fetch user profile by ID
export const getProfile = async (userId: string): Promise<UserProfile> => {
  const data = await apiClient.get(`/users/${userId}`);
  return data;
};

// Update user profile by ID
export const updateProfile = async (
  userId: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const updated = await apiClient.patch(`/users/${userId}`, data);
  return updated;
};

// Login
export const login = async (username: string, password: string) => {
  const data = await apiClient.post("/users/login", { username, password });

  if (data.token) await AsyncStorage.setItem("token", data.token);
  if (data.user?._id || data.user?.id)
    await AsyncStorage.setItem("userId", data.user._id || data.user.id);

  return data;
};

// Register
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

  if (data.token) await AsyncStorage.setItem("token", data.token);
  if (data.user?._id || data.user?.id)
    await AsyncStorage.setItem("userId", data.user._id || data.user.id);

  return data;
};
