import apiClient from "./client";

export const login = async (username: string, password: string) => {
  const { data } = await apiClient.post("/users/login", { username, password });
  return data; // Assuming this returns { token: "..." }
};

export const register = async (
  email: string,
  password: string,
  username: string,
) => {
  const { data } = await apiClient.post("/users/register", {
    email,
    password,
    username,
  });
  return data;
};
