// src/api/todoService.ts
import { apiClient } from "./client";
import { Todo } from "../types/todo";

// Get all todos for the logged-in user
export const getTodos = async (): Promise<Todo[]> => {
  return await apiClient.get("/todos/list");
};

export const createTodo = async (
  newTodoData: Pick<Todo, "title" | "description" | "dueDate" | "completed">,
): Promise<Todo> => {
  const payload = {
    ...newTodoData,
    dueDate: newTodoData.dueDate
      ? newTodoData.dueDate.toISOString().split("T")[0]
      : null,
  };
  return await apiClient.post("/todos/create", payload);
};

export const toggleTodoStatus = async (
  id: string,
  completed: boolean,
): Promise<Todo> => {
  return await apiClient.patch(`/todos/${id}`, { completed });
};

export const updateTodo = async (
  id: string,
  updatedFields: Partial<
    Omit<Todo, "userId" | "_id" | "id" | "createdAt" | "updatedAt">
  >,
): Promise<Todo> => {
  const payload = {
    ...updatedFields,
    dueDate:
      updatedFields.dueDate instanceof Date
        ? updatedFields.dueDate.toISOString().split("T")[0]
        : updatedFields.dueDate,
  };
  return await apiClient.patch(`/todos/${id}`, payload);
};

export const deleteTodo = async (id: string): Promise<void> => {
  await apiClient.delete(`/todos/${id}`);
};
