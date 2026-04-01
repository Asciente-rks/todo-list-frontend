// src/api/todoService.ts
import { apiClient } from "./client";
import { Todo } from "../types/todo";

// Get all todos for the logged-in user
export const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get("/todos/list");
  return response.data; // Axios wraps the response in data
};

// Create a new todo
export const createTodo = async (
  newTodoData: Pick<Todo, "title" | "description" | "dueDate" | "completed">,
): Promise<Todo> => {
  const payload = {
    ...newTodoData,
    dueDate: newTodoData.dueDate
      ? newTodoData.dueDate.toISOString().split("T")[0]
      : null,
  };
  const response = await apiClient.post("/todos/create", payload);
  return response.data;
};

// Toggle the completed status
export const toggleTodoStatus = async (
  id: string,
  completed: boolean,
): Promise<Todo> => {
  const response = await apiClient.patch(`/todos/${id}`, { completed });
  return response.data;
};

// Update a todo (title, description, dueDate)
export const updateTodo = async (
  id: string,
  updatedFields: Partial<
    Omit<Todo, "id" | "_id" | "userId" | "createdAt" | "updatedAt">
  >,
): Promise<Todo> => {
  const payload = {
    ...updatedFields,
    dueDate:
      updatedFields.dueDate instanceof Date
        ? updatedFields.dueDate.toISOString().split("T")[0]
        : (updatedFields.dueDate ?? null),
  };
  const response = await apiClient.patch(`/todos/${id}`, payload);
  return response.data;
};

// Delete a todo
export const deleteTodo = async (id: string): Promise<void> => {
  await apiClient.delete(`/todos/${id}`);
};
