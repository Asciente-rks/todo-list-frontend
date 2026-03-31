import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle, Circle, Trash2 } from "lucide-react-native"; // Import icons
import { Todo } from "../types/todo";

interface Props {
  item: Todo;
  onToggle: (item: Todo) => void;
  onDelete: (item: Todo) => void;
  onEdit: (item: Todo) => void;
}

export const TodoItem = ({ item, onToggle, onDelete, onEdit }: Props) => {
  const toggleIconColor = item.completed ? "#28a745" : "#6c757d"; // Green for completed, gray for incomplete
  const toggleIconSize = 24;

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity
        onPress={() => onToggle(item)}
        style={styles.radioButton}
      >
        {item.completed ? (
          <CheckCircle
            color={toggleIconColor}
            size={toggleIconSize}
            fill={toggleIconColor}
          />
        ) : (
          <Circle color={toggleIconColor} size={toggleIconSize} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onEdit(item)}
        style={styles.todoTextContainer}
        activeOpacity={0.7}
      >
        <View>
          <Text
            style={[styles.todoText, item.completed && styles.completedText]}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.descriptionText}>{item.description}</Text>
          ) : null}
          {item.dueDate ? (
            <Text style={styles.dueDateText}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item)}>
        <Trash2 color="#dc3545" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  radioButton: {
    padding: 4,
  },
  todoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  todoText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#212529",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#adb5bd",
  },
  descriptionText: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 4,
    lineHeight: 18,
  },
  dueDateText: {
    fontSize: 13,
    color: "#007bff",
    marginTop: 6,
    fontWeight: "500",
  },
});
