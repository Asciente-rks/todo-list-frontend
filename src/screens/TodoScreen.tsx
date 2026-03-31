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
  Modal,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { User, LogOut, UserCircle } from "lucide-react-native";

interface Props {
  onLogout: () => void;
}

export const TodoScreen = ({ onLogout }: Props) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Profile Menu State
  const [isMenuVisible, setMenuVisible] = useState(false);

  // User Edit Modal State
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const fetchData = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLoading(true);
    try {
      const [todoData, userId] = await Promise.all([
        getTodos(),
        AsyncStorage.getItem("userId"),
      ]);

      setTodos(todoData);

      if (userId) {
        const userData = await getProfile(userId);
        setUser(userData);
      }
    } catch (error) {
      Alert.alert("Connection Error", "Ensure your backend is awake.");
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
        completed: false,
        dueDate,
      }); // Pass all new task properties
      setTodos([...todos, newTodo]);
    } catch (error) {
      Alert.alert("Error", "Could not add task");
    }
  };

  const handleToggle = async (todo: Todo) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const id = todo._id || todo.id;
    try {
      const updatedTodo = await toggleTodoStatus(todo, !todo.completed);
      setTodos(todos.map((t) => ((t._id || t.id) === id ? updatedTodo : t)));
    } catch (error) {
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
    } catch (error) {
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
      setEditModalVisible(false);
      setEditingTodo(null);
    } catch (error) {
      Alert.alert("Error", "Could not save changes");
    }
  };

  const handleOpenProfile = () => {
    if (!user) return;
    setMenuVisible(false);
    setEditUsername(user.username);
    setEditEmail(user.email);
    setNewPassword("");
    setCurrentPassword("");
    setProfileModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    const targetId = user?._id || user?.id;
    if (!targetId || !currentPassword) {
      return Alert.alert(
        "Required",
        "Please enter your current password to save changes.",
      );
    }

    setIsUpdatingUser(true);
    try {
      const payload: any = {
        username: editUsername,
        email: editEmail,
        password: currentPassword, // Backend usually needs this for verification
      };
      if (newPassword) payload.newPassword = newPassword;

      const updated = await updateProfile(targetId, payload);
      setUser(updated);
      setProfileModalVisible(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error.response?.data?.error || "Check your current password.",
      );
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    setTodos([]);
    setMenuVisible(false);
    onLogout();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Tasks</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.profileButton}
        >
          <UserCircle color="#007bff" size={32} />
        </TouchableOpacity>
      </View>

      <TodoInput onAdd={handleAddTodo} />

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

      {/* Profile Selection Menu */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenProfile}
            >
              <User size={20} color="#495057" />
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <LogOut size={20} color="#dc3545" />
              <Text style={[styles.menuItemText, { color: "#dc3545" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* User Profile Edit Modal */}
      <Modal
        visible={isProfileModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.modalInput}
              value={editUsername}
              placeholderTextColor="#999"
              onChangeText={setEditUsername}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              placeholderTextColor="#999"
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>
              New Password (leave blank to keep)
            </Text>
            <TextInput
              style={styles.modalInput}
              value={newPassword}
              placeholderTextColor="#999"
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <View style={styles.reauthContainer}>
              <Text style={styles.reauthLabel}>Confirm Current Password</Text>
              <TextInput
                style={[styles.modalInput, styles.confirmInput]}
                value={currentPassword}
                placeholderTextColor="#999"
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Enter current password"
              />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, isUpdatingUser && { opacity: 0.7 }]}
                onPress={handleUpdateProfile}
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>

            <TextInput
              style={styles.modalInput}
              value={editTitle}
              placeholderTextColor="#999"
              onChangeText={setEditTitle}
              placeholder="Task Title"
            />

            <TextInput
              style={[styles.modalInput, styles.modalDescription]}
              value={editDescription}
              placeholderTextColor="#999"
              onChangeText={setEditDescription}
              placeholder="Description (optional)"
              multiline
            />

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEditDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {editDueDate
                  ? `📅 ${editDueDate.toLocaleDateString()}`
                  : "Set Due Date"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showEditDatePicker && (
          <DateTimePicker
            value={editDueDate || new Date()}
            mode="date"
            onChange={(event, date) => {
              setShowEditDatePicker(false);
              if (date) setEditDueDate(date);
            }}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Reduced padding for better use of screen space
    paddingHorizontal: 20,
    backgroundColor: "#f0f2f5", // Softer background color
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  header: { fontSize: 30, fontWeight: "bold", color: "#212529" }, // Slightly larger and darker header
  profileButton: {
    padding: 4,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  menuContent: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    width: 160,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#495057",
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#f1f3f5",
    marginHorizontal: 8,
  },
  listContent: {
    paddingBottom: 40, // Space at the bottom so items aren't cut off
  },
  debugContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    padding: 5,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  debugText: { fontSize: 12, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#212529",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    color: "#212529",
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: "500",
  },
  modalDescription: { minHeight: 80, textAlignVertical: "top" },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    marginBottom: 20,
  },
  dateButtonText: { color: "#495057", fontSize: 16 },
  modalButtonRow: { flexDirection: "row", gap: 10 },
  modalButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#007bff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: { color: "#495057", fontWeight: "600" },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  reauthContainer: {
    backgroundColor: "#fff9db",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  reauthLabel: {
    fontSize: 13,
    color: "#868e96",
    marginBottom: 8,
    textAlign: "center",
  },
  confirmInput: { backgroundColor: "#fff", marginBottom: 0 },
});
