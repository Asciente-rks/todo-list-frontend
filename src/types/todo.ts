export interface Todo {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
  description?: string;
  dueDate?: Date | null;
  userId?: string; // optional for creation, backend will require it
  createdAt?: string;
  updatedAt?: string;
}
