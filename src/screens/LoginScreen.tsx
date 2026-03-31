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

  useEffect(() => {
    // Pre-warm the Render backend using your new operational route.
    // This "rings the doorbell" so Render starts booting while you type.
    apiClient.get("").catch(() => {
      /* Ignore errors; we just want to trigger the spin-up */
    });

    // Sanity check for the built app
    if (!process.env.EXPO_PUBLIC_API_URL) {
      console.warn(
        "API URL is undefined. Check your EAS Secrets or .env file.",
      );
    }
  }, []);

  const handleLogin = async () => {
    if (!username || !password)
      return Alert.alert("Error", "Please fill in all fields");

    setLoading(true);

    // Set a timer to show wake-up message if it takes longer than 3 seconds
    const wakeUpTimer = setTimeout(() => setIsWakingUp(true), 3000);

    try {
      const data = await login(username, password);
      await AsyncStorage.setItem("token", data.token);
      const userId = data.user?._id || data.user?.id;
      if (userId) {
        await AsyncStorage.setItem("userId", userId);
      }
      onAuthSuccess();
    } catch (error: any) {
      const status: number | undefined = error.response?.status;
      const url: string = apiClient.defaults.baseURL ?? "URL_NOT_SET";
      const backendError =
        error.response?.data?.error || error.message || "Unknown Error";

      if (error.message === "Network Error" || !status) {
        Alert.alert(
          "Server Waking Up",
          "The backend is spinning up (Render Free Tier delay). We've sent a wake-up signal. Please wait 20 seconds and tap Login again.",
          [
            { text: "Retry Now", onPress: handleLogin },
            { text: "Wait", style: "cancel" },
          ],
        );
      } else {
        Alert.alert(
          "Login Failed",
          `Status: ${status ?? "No Connection"}\nURL: ${url}\nError: ${backendError}`,
        );
      }
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
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator color="#fff" />
            {isWakingUp && (
              <Text style={{ color: "#fff", marginLeft: 10 }}>
                Waking up server...
              </Text>
            )}
          </View>
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
