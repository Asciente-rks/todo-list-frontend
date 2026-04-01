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

// Helper: remove undefined/null keys from payload
const cleanPayload = (obj: Record<string, any>) => {
  const payload: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) payload[k] = v;
  });
  return payload;
};

// Get the currently logged-in user's profile
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) throw new Error("User ID not found in AsyncStorage");

    const response = await apiClient.get(`/users/${userId}`);
    return response.data ?? response;
  } catch (err) {
    console.error("❌ getProfile failed", err);
    throw err;
  }
};

// Update the currently logged-in user's profile
export const updateProfile = async (
  data: Partial<Pick<UserProfile, "username" | "email">>,
): Promise<UserProfile> => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) throw new Error("User ID not found in AsyncStorage");

    const payload = cleanPayload(data);
    const response = await apiClient.patch(`/users/${userId}`, payload);
    return response.data ?? response;
  } catch (err) {
    console.error("❌ updateProfile failed", err);
    throw err;
  }
};
