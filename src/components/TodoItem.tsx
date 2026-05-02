import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { CheckCircle, Circle, Trash2 } from "lucide-react-native";
import { Todo } from "../types/todo";
import { theme } from "../theme";

interface Props {
  item: Todo;
  onToggle: (item: Todo) => void;
  onDelete: (item: Todo) => void;
  onEdit: (item: Todo) => void;
}

export const TodoItem = ({ item, onToggle, onDelete, onEdit }: Props) => {
  const checkScale = useRef(new Animated.Value(1)).current;
  const trashScale = useRef(new Animated.Value(1)).current;

  const handleCheckPress = () => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(checkScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(item);
  };

  const handleTrashPress = () => {
    Animated.sequence([
      Animated.timing(trashScale, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(trashScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onDelete(item);
  };

  return (
    <View style={styles.todoItem}>
      <TouchableOpacity onPress={handleCheckPress} style={styles.checkButton}>
        <Animated.View
          style={[
            {
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          {item.completed ? (
            <CheckCircle
              color={theme.colors.success}
              size={24}
              fill={theme.colors.success}
            />
          ) : (
            <Circle color={theme.colors.textMuted} size={24} />
          )}
        </Animated.View>
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
      <TouchableOpacity onPress={handleTrashPress} style={styles.deleteButton}>
        <Animated.View
          style={[
            {
              transform: [{ scale: trashScale }],
            },
          ]}
        >
          <Trash2 color={theme.colors.danger} size={20} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  todoItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  checkButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    padding: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  todoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  todoText: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: theme.colors.textMuted,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  dueDateText: {
    fontSize: 13,
    color: theme.colors.accentStrong,
    marginTop: 6,
    fontWeight: "600",
  },
});
