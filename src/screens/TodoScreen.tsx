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
  Pressable,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Todo } from "../types/todo";
import { TodoItem } from "../components/TodoItem";
import { TodoInput } from "../components/TodoInput";
import { UserCircle, Plus, Calendar, X } from "lucide-react-native";
import {
  getTodos,
  createTodo,
  toggleTodoStatus,
  deleteTodo,
  updateTodo,
} from "../api/todoService";
import { getProfile, updateProfile, UserProfile } from "../api/userService";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  onLogout: () => void;
}

export const TodoScreen = ({ onLogout }: Props) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modals visibility
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const [isPassConfirmVisible, setPassConfirmVisible] = useState(false);
  const [isChangePassVisible, setChangePassVisible] = useState(false);

  // Profile data
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Todo Edit Modal
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  // Fetch todos and user profile
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

  // Add Todo
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
      setAddModalVisible(false);
    } catch {
      Alert.alert("Error", "Could not add task");
    }
  };

  // Toggle Todo complete
  const handleToggle = async (todo: Todo) => {
    const id = todo._id || todo.id;
    if (!id) return;

    try {
      const updated = await toggleTodoStatus(id, !todo.completed, todo.title);
      setTodos(todos.map((t) => ((t._id || t.id) === id ? updated : t)));
    } catch {
      Alert.alert("Error", "Could not update status");
    }
  };

  // Delete Todo
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

  // Edit Todo modal
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate) : null);
    setShowEditDatePicker(false);
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

  // Profile modal
  const handleOpenProfile = () => {
    if (!user) return;
    setEditUsername(user.username);
    setEditEmail(user.email);
    setNewPassword("");
    setConfirmNewPassword("");
    setCurrentPassword("");
    setProfileModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    const trimmedCurrent = currentPassword.trim();
    if (!trimmedCurrent) {
      return Alert.alert(
        "Required",
        "Please enter your current password to save changes.",
      );
    }

    if (isUpdatingUser) return;

    setIsUpdatingUser(true);
    try {
      const payload = {
        username: editUsername,
        email: editEmail,
        currentPassword: trimmedCurrent,
      };

      const updated = await updateProfile(payload);
      setUser(updated);
      setPassConfirmVisible(false);
      setProfileModalVisible(false);
      setCurrentPassword("");
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Check your input");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleChangePassword = async () => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    if (
      !trimmedCurrent ||
      !trimmedNew ||
      trimmedNew !== confirmNewPassword.trim()
    ) {
      return Alert.alert("Error", "Passwords must match and cannot be empty");
    }
    if (isUpdatingUser) return;

    setIsUpdatingUser(true);
    try {
      await updateProfile({
        currentPassword: trimmedCurrent,
        password: trimmedNew,
      });
      setChangePassVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      Alert.alert("Success", "Password changed successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Logout
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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>My Tasks</Text>
        <TouchableOpacity onPress={handleOpenProfile}>
          <UserCircle color="#007AFF" size={32} />
        </TouchableOpacity>
      </View>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Plus color="#fff" size={20} />
        <Text style={styles.addTaskButtonText}>Add Task</Text>
      </TouchableOpacity>

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

      {/* Add Task Modal (Floating Center) */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setAddModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Task</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <TodoInput onAdd={handleAddTodo} />
          </View>
        </Pressable>
      </Modal>

      {/* Edit Profile Modal (Floating Center) */}
      <Modal visible={isProfileModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setProfileModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Settings</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.iosInput}
                value={editUsername}
                onChangeText={setEditUsername}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.iosInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setPassConfirmVisible(true)}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setChangePassVisible(true)}
            >
              <Text style={styles.secondaryButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogout}
            >
              <Text style={[styles.secondaryButtonText, { color: "#FF3B30" }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Password Confirmation Modal */}
      <Modal visible={isPassConfirmVisible} transparent animationType="fade">
        <View style={styles.overlayCenter}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Confirm Changes</Text>
            <Text style={styles.alertSub}>Enter current password to save.</Text>
            <TextInput
              style={styles.iosInput}
              secureTextEntry
              placeholderTextColor="#8E8E93"
              placeholder="Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => {
                  setPassConfirmVisible(false);
                  setCurrentPassword("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, isUpdatingUser && { opacity: 0.5 }]}
                onPress={handleUpdateProfile}
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.confirmText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isChangePassVisible} transparent animationType="fade">
        <View style={styles.overlayCenter}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Change Password</Text>
            <TextInput
              style={styles.iosInput}
              secureTextEntry
              placeholderTextColor="#8E8E93"
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.iosInput}
              secureTextEntry
              placeholderTextColor="#8E8E93"
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.iosInput}
              secureTextEntry
              placeholderTextColor="#8E8E93"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertBtn}
                onPress={() => {
                  setChangePassVisible(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertBtn, isUpdatingUser && { opacity: 0.5 }]}
                onPress={handleChangePassword}
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.confirmText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Todo Modal (Floating Center) */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.overlay}
          onPress={() => setEditModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.iosInput}
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.iosInput, { height: 80 }]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
              />
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.iosDateBtn}
                onPress={() => setShowEditDatePicker(true)}
              >
                <Calendar size={18} color="#007AFF" />
                <Text style={styles.iosDateText}>
                  {editDueDate
                    ? editDueDate.toLocaleDateString()
                    : "No date set"}
                </Text>
              </TouchableOpacity>
              {showEditDatePicker && (
                <DateTimePicker
                  value={editDueDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(e, date) => {
                    setShowEditDatePicker(false);
                    if (date) setEditDueDate(date);
                  }}
                />
              )}
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSaveEdit}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#f0f2f5" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 60,
  },
  header: { fontSize: 30, fontWeight: "bold", color: "#212529" },
  listContent: { paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#aaa",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
  },
  sheetContent: { flex: 1, padding: 20, backgroundColor: "#fff" },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "600", color: "#333" },
  cancelButtonText: { color: "#007AFF", fontSize: 17 },
  addTaskButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addTaskButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  iosInput: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    color: "#000000",
    marginBottom: 15,
  },
  label: { fontSize: 14, color: "#8E8E93", marginBottom: 5, fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  secondaryButton: { padding: 16, alignItems: "center", marginTop: 10 },
  secondaryButtonText: { color: "#007AFF", fontSize: 17, fontWeight: "500" },
  overlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 270,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    alignItems: "stretch",
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  alertSub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 15,
    color: "#333",
  },
  alertButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 0.5,
    borderColor: "#C6C6C8",
    marginTop: 10,
    paddingTop: 10,
  },
  alertBtn: { flex: 1, alignItems: "center" },
  confirmText: { color: "#007AFF", fontSize: 17, fontWeight: "600" },
  iosDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 15,
  },
  iosDateText: { fontSize: 16, color: "#007AFF" },
  formGroup: { marginBottom: 20 },
});
