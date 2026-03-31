import apiClient from "./client";

export interface UserProfile {
  _id?: string;
  id?: string;
  username: string;
  email: string;
}

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (
  userId: string,
  data: any,
): Promise<UserProfile> => {
  const response = await apiClient.patch(`/users/${userId}`, data);
  return response.data;
};
