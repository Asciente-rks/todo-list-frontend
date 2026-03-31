import { apiClient } from "./client";
import { Todo } from "../types/todo";

export const getTodos = async (): Promise<Todo[]> => {
  return await apiClient.get("/todos/list");
};

export const createTodo = async (
  newTodo: Pick<Todo, "title" | "description" | "dueDate" | "completed">,
): Promise<Todo> => {
  const payload = {
    ...newTodo,
    dueDate: newTodo.dueDate
      ? newTodo.dueDate.toISOString().split("T")[0]
      : null,
  };
  return await apiClient.post("/todos/create", payload);
};

export const toggleTodoStatus = async (
  todo: Todo,
  completed: boolean,
): Promise<Todo> => {
  const id = todo._id || todo.id;
  if (!id) throw new Error("Todo ID undefined");

  return await apiClient.patch(`/todos/${id}`, {
    completed,
    title: todo.title,
    description: todo.description,
  });
};

export const updateTodo = async (
  id: string,
  updatedFields: Partial<Todo>,
): Promise<Todo> => {
  if (!id) throw new Error("Todo ID undefined");

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
  if (!id) throw new Error("Todo ID undefined");
  await apiClient.delete(`/todos/${id}`);
};
