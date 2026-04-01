import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Get logged-in user's profile
export const getProfile = async (): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("User ID not found in AsyncStorage");
  const response = await apiClient.get(`/users/${userId}`);
  return response;
};

// Update logged-in user's profile
export const updateProfile = async (
  data: Partial<Pick<UserProfile, "username" | "email">> & {
    newPassword?: string;
    password?: string;
  },
): Promise<UserProfile> => {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) throw new Error("User ID not found in AsyncStorage");
  const response = await apiClient.patch(`/users/${userId}`, data);
  return response;
};
