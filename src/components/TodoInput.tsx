import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import { theme } from "../theme";

interface Props {
  onAdd: (title: string, description: string, dueDate: Date | null) => void;
}

export const TodoInput = ({ onAdd }: Props) => {
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control date picker visibility

  const handleAdd = () => {
    if (!task.trim()) return;
    onAdd(task, description, dueDate); // Pass new fields
    setTask("");
    setDescription(""); // Clear description after adding
    setDueDate(null); // Clear due date after adding
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false); // Hide picker after selection
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task..."
        placeholderTextColor="#93A0B5"
        value={task}
        onChangeText={setTask}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description (optional)"
        placeholderTextColor="#adb5bd"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
        returnKeyType="done"
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={16} color={theme.colors.accentStrong} />
          <Text style={styles.datePickerButtonText}>
            {dueDate ? dueDate.toLocaleDateString() : "Set due date"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, !task.trim() && styles.disabledButton]}
          onPress={handleAdd}
          disabled={!task.trim()}
        >
          <Text style={styles.addButtonText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate || new Date()}
          mode="date"
          display="spinner"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: theme.colors.surface,
    padding: 0,
    borderRadius: 0,
    marginBottom: 0,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.text,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: theme.colors.accentStrong,
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 1,
    height: 50,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#97B8F5",
    opacity: 0.6,
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  descriptionInput: {
    minHeight: 60,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceSoft,
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  datePickerButtonText: { color: theme.colors.text, fontWeight: "600" },
});
