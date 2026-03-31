export interface Todo {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
  description?: string; // Make optional
  dueDate?: Date | null; // Make optional and allow null
  userId: string; // Assuming this is part of your Todo structure
  createdAt: string;
  updatedAt: string;
}
