// src/screens/LoginScreen.tsx
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
import { login } from "../api/authService";
import apiClient from "../api/client";

interface Props {
  onAuthSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen = ({ onAuthSuccess, onSwitchToRegister }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);

  // Optional: ping backend on mount to wake it up
  useEffect(() => {
    apiClient.get("").catch(() => {});
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    setLoading(true);
    setIsWakingUp(false);

    let attempts = 0;
    const MAX_RETRIES = 10; // 10 retries, ~20s total
    const wakeUpTimer = setTimeout(() => setIsWakingUp(true), 3000);

    try {
      while (attempts < MAX_RETRIES) {
        try {
          console.log(`🔁 Login attempt #${attempts + 1}`);

          const data = await login(username, password);

          // Save token and userId (redundant but safe)
          if (data.token) await AsyncStorage.setItem("token", data.token);
          const userId = data.user?._id || data.user?.id;
          if (userId) await AsyncStorage.setItem("userId", userId);

          // ✅ Success
          onAuthSuccess();
          return;
        } catch (err: any) {
          const msg = err.message || "";

          console.log("Login attempt failed:", msg);

          // ❌ Stop retrying on real auth error
          if (
            msg.toLowerCase().includes("invalid") ||
            msg.toLowerCase().includes("401")
          ) {
            throw err;
          }

          // ⏳ Backend sleeping → retry after 2s
          await new Promise((res) => setTimeout(res, 2000));
          attempts++;
        }
      }

      throw new Error("Server is taking too long to respond. Try again.");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6c757d"
        value={username}
        onChangeText={setUsername}
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
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister}>
        <Text style={styles.switchText}>Don't have an account? Register</Text>
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
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: {
    marginTop: 20,
    color: "#007bff",
    textAlign: "center",
  },
});
