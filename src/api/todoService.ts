import apiClient from "./client";
import { Todo } from "../types/todo";

export const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get("/todos/list");
  return response.data;
};

export const createTodo = async (
  newTodoData: Pick<Todo, "title" | "description" | "dueDate" | "completed">,
): Promise<Todo> => {
  const payload = {
    ...newTodoData,
    // Format Date object to YYYY-MM-DD string for the backend
    dueDate: newTodoData.dueDate
      ? newTodoData.dueDate.toISOString().split("T")[0]
      : null,
  };
  const response = await apiClient.post("/todos/create", payload);
  return response.data;
};

export const toggleTodoStatus = async (
  todo: Todo,
  completed: boolean,
): Promise<Todo> => {
  const id = todo._id || todo.id;
  if (!id) {
    throw new Error("Todo ID is undefined for toggle status. Cannot update.");
  }
  // Send title and description to satisfy backend validation
  const response = await apiClient.patch(`/todos/${id}`, {
    completed,
    title: todo.title,
    description: todo.description,
  });
  return response.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  if (!id) {
    throw new Error("Todo ID is undefined for delete. Cannot delete.");
  }
  await apiClient.delete(`/todos/${id}`);
};

export const updateTodo = async (
  id: string,
  updatedFields: Partial<Todo>,
): Promise<Todo> => {
  if (!id) {
    throw new Error("Todo ID is undefined for update.");
  }
  const payload = {
    ...updatedFields,
    dueDate:
      updatedFields.dueDate instanceof Date
        ? updatedFields.dueDate.toISOString().split("T")[0]
        : updatedFields.dueDate,
  };
  const response = await apiClient.patch(`/todos/${id}`, payload);
  return response.data;
};
