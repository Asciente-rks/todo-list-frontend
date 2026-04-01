// src/api/userService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

// Type for user profile
export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Get the currently logged-in user's profile
export const getProfile = async (): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");

  if (!userId) {
    throw new Error("User ID not found in AsyncStorage");
  }

  const response = await apiClient.get(`/users/${userId}`);

  // Ensure we return the actual user object, not a wrapped response
  return response.data ?? response;
};

// Update the currently logged-in user's profile
export const updateProfile = async (
  data: Partial<Pick<UserProfile, "username" | "email">>,
): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");

  if (!userId) {
    throw new Error("User ID not found in AsyncStorage");
  }

  const response = await apiClient.patch(`/users/${userId}`, data);

  // Return updated user object
  return response.data ?? response;
};
