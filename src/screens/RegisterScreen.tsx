// src/screens/RegisterScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register } from "../api/authService";
import apiClient from "../api/client";

interface Props {
  onAuthSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen = ({ onAuthSuccess, onSwitchToLogin }: Props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  // Optional: wake backend on mount
  useEffect(() => {
    apiClient.get("").catch(() => {});
  }, []);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    setLoading(true);
    setIsWakingUp(false);

    let attempts = 0;
    const MAX_RETRIES = 10; // Retry ~20s if backend asleep
    const wakeUpTimer = setTimeout(() => setIsWakingUp(true), 3000);

    try {
      while (attempts < MAX_RETRIES) {
        try {
          console.log(`🔁 Register attempt #${attempts + 1}`);

          // Order matches authService: email, username, password
          const data = await register(email, username, password);

          // Save token and userId if backend returns it
          if (data.token) await AsyncStorage.setItem("token", data.token);
          const userId = data.user?._id || data.user?.id;
          if (userId) await AsyncStorage.setItem("userId", userId);

          // ✅ Success: automatically log in the user
          onAuthSuccess();
          return;
        } catch (err: any) {
          const msg = err.message || "";

          console.log("Register attempt failed:", msg);

          // Stop retrying on real validation error
          if (
            msg.toLowerCase().includes("already") ||
            msg.toLowerCase().includes("invalid") ||
            msg.toLowerCase().includes("400")
          ) {
            throw err;
          }

          // Retry after 2s if backend sleeping
          await new Promise((res) => setTimeout(res, 2000));
          attempts++;
        }
      }

      throw new Error("Server is taking too long to respond. Try again.");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong",
      );
    } finally {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6c757d"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6c757d"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6c757d"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading && isWakingUp && (
        <Text style={styles.wakeText}>Waking up backend server...</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    color: "#000",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  wakeText: {
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: { marginTop: 20, color: "#007bff", textAlign: "center" },
});
