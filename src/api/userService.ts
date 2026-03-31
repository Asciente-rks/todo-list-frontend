// src/api/userService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Fetch profile
export const getProfile = async (userId: string): Promise<UserProfile> => {
  return await apiClient.get(`/users/${userId}`);
};

// Update profile
export const updateProfile = async (
  userId: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  return await apiClient.patch(`/users/${userId}`, data);
};
