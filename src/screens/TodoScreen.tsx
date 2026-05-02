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
import { theme } from "../theme";
import { Image } from "react-native";

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
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

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
  const [isDeletingTodo, setIsDeletingTodo] = useState(false);

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
  const handleDelete = (todo: Todo) => {
    setTodoToDelete(todo);
    setDeleteConfirmVisible(true);
  };

  const confirmDeleteTodo = async () => {
    if (!todoToDelete) return;
    const id = todoToDelete._id || todoToDelete.id;
    if (!id) return;

    setIsDeletingTodo(true);
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteTodo(id);
      setTodos(todos.filter((t) => (t._id || t.id) !== id));
      setDeleteConfirmVisible(false);
      setTodoToDelete(null);
    } catch {
      Alert.alert("Error", "Could not delete todo");
      setDeleteConfirmVisible(false);
    } finally {
      setIsDeletingTodo(false);
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

      <View style={styles.backgroundBlobOne} />
      <View style={styles.backgroundBlobTwo} />

      <View style={styles.hero}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.kicker}>TaskFlow</Text>
          <Text style={styles.header}>My Tasks</Text>
          <Text style={styles.heroCopy}>
            A clear view of what is next, what is done, and what still matters.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenProfile}
          style={styles.profileButton}
        >
          <UserCircle color={theme.colors.accentStrong} size={34} />
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Image
          source={require("../../assets/splash-icon.png")}
          style={styles.heroIcon}
        />
        <View style={styles.heroCardCopy}>
          <Text style={styles.heroCardTitle}>
            {user ? `Welcome, ${user.username}` : "Welcome back"}
          </Text>
          <Text style={styles.heroCardSub}>
            Keep your day moving with one focused list.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addTaskButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Plus color="#fff" size={20} />
        <Text style={styles.addTaskButtonText}>Add Task</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.accentStrong}
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
          showsVerticalScrollIndicator={false}
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
                style={styles.themedInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholderTextColor={theme.colors.textMuted}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.themedInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setPassConfirmVisible(true)}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.accentButton}
              onPress={() => setChangePassVisible(true)}
            >
              <Text style={styles.accentButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleLogout}
            >
              <Text style={styles.dangerButtonText}>Logout</Text>
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
              style={styles.themedInput}
              secureTextEntry
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => {
                  setPassConfirmVisible(false);
                  setCurrentPassword("");
                }}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertConfirmBtn,
                  isUpdatingUser && { opacity: 0.6 },
                ]}
                onPress={handleUpdateProfile}
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.alertConfirmText}>Confirm</Text>
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
              style={styles.themedInput}
              secureTextEntry
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.themedInput}
              secureTextEntry
              placeholderTextColor={theme.colors.textMuted}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.themedInput}
              secureTextEntry
              placeholderTextColor={theme.colors.textMuted}
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => {
                  setChangePassVisible(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                }}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertConfirmBtn,
                  isUpdatingUser && { opacity: 0.6 },
                ]}
                onPress={handleChangePassword}
                disabled={isUpdatingUser}
              >
                {isUpdatingUser ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.alertConfirmText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteConfirmVisible} transparent animationType="fade">
        <View style={styles.overlayCenter}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Delete Task?</Text>
            <Text style={styles.alertSub}>
              Are you sure you want to delete "{todoToDelete?.title}"? This
              action cannot be undone.
            </Text>
            <View style={styles.alertButtonsRow}>
              <TouchableOpacity
                style={styles.alertCancelBtn}
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  setTodoToDelete(null);
                }}
              >
                <Text style={styles.alertCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.alertDangerBtn,
                  isDeletingTodo && { opacity: 0.6 },
                ]}
                onPress={confirmDeleteTodo}
                disabled={isDeletingTodo}
              >
                {isDeletingTodo ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.alertDangerText}>Delete</Text>
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
                style={styles.themedInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholderTextColor={theme.colors.textMuted}
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.themedInput, { height: 80 }]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                placeholderTextColor={theme.colors.textMuted}
              />
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity
                style={styles.themeeDateBtn}
                onPress={() => setShowEditDatePicker(true)}
              >
                <Calendar size={18} color={theme.colors.accentStrong} />
                <Text style={styles.themeDateText}>
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.background,
  },
  backgroundBlobOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(37,99,235,0.12)",
    top: -70,
    right: -80,
  },
  backgroundBlobTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 180,
    backgroundColor: "rgba(22,163,74,0.10)",
    top: 140,
    left: -70,
  },
  hero: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 56,
  },
  heroTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  kicker: {
    color: theme.colors.accentStrong,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  header: { fontSize: 32, fontWeight: "800", color: theme.colors.text },
  heroCopy: {
    color: theme.colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  heroCardCopy: {
    flex: 1,
    marginLeft: 14,
  },
  heroCardTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  heroCardSub: {
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: { paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: theme.colors.textMuted,
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
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
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
  modalTitle: { fontSize: 22, fontWeight: "700", color: theme.colors.text },
  cancelButtonText: { color: theme.colors.accentStrong, fontSize: 17 },
  addTaskButton: {
    backgroundColor: theme.colors.accentStrong,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 8,
  },
  addTaskButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  themedInput: {
    backgroundColor: theme.colors.surfaceSoft,
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 5,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: theme.colors.accentStrong,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  accentButton: {
    backgroundColor: theme.colors.accentSoft,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  accentButtonText: {
    color: theme.colors.accentStrong,
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "rgba(225, 29, 72, 0.1)",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  dangerButtonText: {
    color: theme.colors.danger,
    fontSize: 16,
    fontWeight: "700",
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 22,
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    color: theme.colors.text,
  },
  alertSub: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  alertButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  alertCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertCancelText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  alertConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.accentStrong,
    alignItems: "center",
  },
  alertConfirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  alertDangerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
  },
  alertDangerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  themeeDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    padding: 12,
    borderRadius: 14,
    gap: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  themeDateText: {
    fontSize: 15,
    color: theme.colors.accentStrong,
    fontWeight: "700",
  },
  formGroup: { marginBottom: 20 },
});
