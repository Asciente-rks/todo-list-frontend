// src/api/todoService.ts
import { apiClient } from "./client";
import { Todo } from "../types/todo";

// Helper: remove undefined/null keys from payload
const cleanPayload = (obj: Record<string, any>) => {
  const payload: Record<string, any> = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) payload[k] = v;
  });
  return payload;
};

// Get all todos for the logged-in user
export const getTodos = async (): Promise<Todo[]> => {
  try {
    return await apiClient.get("/todos/list");
  } catch (err) {
    console.error("❌ getTodos failed", err);
    throw err;
  }
};

// Create a new todo
export const createTodo = async (
  newTodoData: Pick<Todo, "title" | "description" | "dueDate" | "completed">,
): Promise<Todo> => {
  try {
    const payload = cleanPayload({
      ...newTodoData,
      dueDate: newTodoData.dueDate
        ? newTodoData.dueDate.toISOString().split("T")[0]
        : null,
    });
    return await apiClient.post("/todos/create", payload);
  } catch (err) {
    console.error("❌ createTodo failed", err);
    throw err;
  }
};

// Toggle todo completion status
export const toggleTodoStatus = async (
  id: string,
  completed: boolean,
): Promise<Todo> => {
  try {
    const payload = cleanPayload({ completed });
    return await apiClient.patch(`/todos/${id}`, payload);
  } catch (err) {
    console.error("❌ toggleTodoStatus failed", err);
    throw err;
  }
};

// Update todo fields
export const updateTodo = async (
  id: string,
  updatedFields: Partial<
    Omit<Todo, "userId" | "_id" | "id" | "createdAt" | "updatedAt">
  >,
): Promise<Todo> => {
  try {
    const payload = cleanPayload({
      ...updatedFields,
      dueDate:
        updatedFields.dueDate instanceof Date
          ? updatedFields.dueDate.toISOString().split("T")[0]
          : updatedFields.dueDate,
    });
    return await apiClient.patch(`/todos/${id}`, payload);
  } catch (err) {
    console.error("❌ updateTodo failed", err);
    throw err;
  }
};

// Delete todo
export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/todos/${id}`);
  } catch (err) {
    console.error("❌ deleteTodo failed", err);
    throw err;
  }
};
