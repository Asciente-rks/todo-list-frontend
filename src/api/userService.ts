// src/api/userService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");

  if (!userId) {
    throw new Error("User ID not found");
  }

  return await apiClient.get(`/users/${userId}`);
};

export const updateProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");

  if (!userId) {
    throw new Error("User ID not found");
  }

  return await apiClient.patch(`/users/${userId}`, data);
};
