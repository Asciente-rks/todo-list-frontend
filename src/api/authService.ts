import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./client";

export const login = async (username: string, password: string) => {
  const data = await apiClient.post("/users/login", { username, password });

  if (data.token) await AsyncStorage.setItem("token", data.token);
  if (data.user?._id || data.user?.id)
    await AsyncStorage.setItem("userId", data.user._id || data.user.id);

  return data;
};

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
