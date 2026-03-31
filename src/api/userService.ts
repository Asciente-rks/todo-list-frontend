import { apiClient } from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

// Get user profile by ID
export const getProfile = async (userId: string): Promise<UserProfile> => {
  return await apiClient.get(`/users/${userId}`);
};

// Update user profile by ID
export const updateProfile = async (
  userId: string,
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  return await apiClient.patch(`/users/${userId}`, data);
};
