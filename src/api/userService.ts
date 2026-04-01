import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Get currently logged-in user's profile
export const getProfile = async (): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("User ID not found in AsyncStorage");

  const response = await apiClient.get(`/users/${userId}`);
  return response?.data || response;
};

// Update currently logged-in user's profile
export const updateProfile = async (data: {
  username?: string;
  email?: string;
  password?: string;
  newPassword?: string;
}): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("User ID not found in AsyncStorage");

  const response = await apiClient.patch(`/users/${userId}`, data);
  return response?.data || response;
};
