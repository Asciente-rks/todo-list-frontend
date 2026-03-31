import apiClient from "./client";

export const login = async (username: string, password: string) => {
  const res = await fetch(
    "https://todo-list-backend-4li8.onrender.com/api/users/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    },
  );

  const data = await res.json();
  return data;
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
