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
  Animated,
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
  const fadeAnim = useState(new Animated.Value(0))[0]; // for fade-in card

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

    // Show the "waking up" card if backend takes longer than 1.5s
    const wakeUpTimer = setTimeout(() => {
      setIsWakingUp(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1500);

    try {
      const data = await login(username, password);

      // Save token and userId
      if (data.token) await AsyncStorage.setItem("token", data.token);
      const userId = data.user?._id || data.user?.id;
      if (userId) await AsyncStorage.setItem("userId", userId);

      // ✅ Login successful
      onAuthSuccess();
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      Alert.alert("Login Failed", msg);
    } finally {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      fadeAnim.setValue(0);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Floating Waking Up Card */}
      {isWakingUp && (
        <Animated.View style={[styles.wakeCard, { opacity: fadeAnim }]}>
          <Text style={styles.wakeText}>Waking up backend server...</Text>
        </Animated.View>
      )}

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

      <TouchableOpacity
        style={[styles.button, loading ? { opacity: 0.7 } : {}]}
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
  wakeCard: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    zIndex: 10,
    alignItems: "center",
  },
  wakeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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
