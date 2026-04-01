// src/screens/TodoScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getTodos,
  createTodo,
  toggleTodoStatus,
  deleteTodo,
  updateTodo,
} from "../api/todoService";
import { getProfile, updateProfile, UserProfile } from "../api/userService";
import { Todo } from "../types/todo";
import { TodoItem } from "../components/TodoItem";
import { TodoInput } from "../components/TodoInput";
import { UserCircle } from "lucide-react-native";

interface Props {
  onLogout: () => void;
}

export const TodoScreen = ({ onLogout }: Props) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Profile Modal
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Todo Edit Modal
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);

  const fetchData = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLoading(true);
    try {
      const todosData = await getTodos();
      setTodos(todosData);

      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", "Failed to load todos or profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (
    title: string,
    description: string,
    dueDate: Date | null,
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      const newTodo = await createTodo({
        title,
        description,
        dueDate,
        completed: false,
      });
      setTodos([...todos, newTodo]);
    } catch (error) {
      Alert.alert("Error", "Could not add task");
    }
  };

  const handleToggle = async (todo: Todo) => {
    const id = todo._id || todo.id;
    if (!id) return;

    try {
      const updated = await toggleTodoStatus(id, !todo.completed);
      setTodos(todos.map((t) => ((t._id || t.id) === id ? updated : t)));
    } catch {
      Alert.alert("Error", "Could not update status");
    }
  };

  const handleDelete = async (todo: Todo) => {
    const id = todo._id || todo.id;
    if (!id) return;

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteTodo(id);
      setTodos(todos.filter((t) => (t._id || t.id) !== id));
    } catch {
      Alert.alert("Error", "Could not delete todo");
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTodo || !editTitle.trim()) return;
    const id = editingTodo._id || editingTodo.id;
    if (!id) return;

    try {
      const updated = await updateTodo(id, {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
      });
      setTodos(todos.map((t) => ((t._id || t.id) === id ? updated : t)));
      setEditingTodo(null);
      setEditModalVisible(false);
    } catch {
      Alert.alert("Error", "Could not save changes");
    }
  };

  const handleOpenProfile = () => {
    if (!user) return;
    setEditUsername(user.username);
    setEditEmail(user.email);
    setNewPassword("");
    setCurrentPassword("");
    setProfileModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!currentPassword) {
      return Alert.alert(
        "Required",
        "Please enter your current password to save changes.",
      );
    }
    setIsUpdatingUser(true);
    try {
      const payload: any = { username: editUsername, email: editEmail };
      if (newPassword) payload.newPassword = newPassword;

      const updated = await updateProfile(payload);
      setUser(updated);
      setProfileModalVisible(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Check your input");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    setTodos([]);
    onLogout();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Tasks</Text>
        <TouchableOpacity onPress={handleOpenProfile}>
          <UserCircle color="#007bff" size={32} />
        </TouchableOpacity>
      </View>

      {/* Todo Input */}
      <TodoInput onAdd={handleAddTodo} />

      {/* Todo List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6c757d"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item, index) =>
            item._id || item.id || index.toString()
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TodoItem
              item={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks yet. Get started!</Text>
          }
        />
      )}

      {/* Profile & Edit Modals */}
      {/* Keep your existing modal components here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#f0f2f5",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  header: { fontSize: 30, fontWeight: "bold", color: "#212529" },
  listContent: { paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
    fontSize: 16,
  },
});
