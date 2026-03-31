import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Import DateTimePicker

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
        value={task}
        onChangeText={setTask}
        onSubmitEditing={handleAdd}
        returnKeyType="done"
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description (optional)"
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
          <Text style={styles.datePickerButtonText}>
            {dueDate ? `📅 ${dueDate.toLocaleDateString()}` : "Set Due Date"}
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
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    gap: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#007bff",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    height: 45,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#b3d7ff",
  },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  descriptionInput: {
    minHeight: 60, // Slightly more space for description
    paddingTop: 12, // Ensure text starts comfortably from the top
    textAlignVertical: "top", // For Android multiline input to start text at the top
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButtonText: { color: "#343a40" },
});
