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
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register, login } from "../api/authService";
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
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    apiClient.get("").catch(() => {});
  }, []);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (errorMsg) setErrorMsg(null);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errorMsg) setErrorMsg(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMsg) setErrorMsg(null);
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    setErrorMsg(null);
    setLoading(true);
    setIsWakingUp(false);

    let countdownInterval: any;
    const wakeUpTimer = setTimeout(() => {
      setIsWakingUp(true);
      setSecondsRemaining(60);
      countdownInterval = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 1500);

    try {
      const data = await register(email, username, password);

      const token = data.token;
      if (token) await AsyncStorage.setItem("token", token);
      const userId = data.user?._id || data.user?.id || data.id;
      if (userId) await AsyncStorage.setItem("userId", userId);

      onAuthSuccess();
    } catch (err: any) {
      // 💡 Handle Render Free Tier race condition:
      // If registration says "exists", it's likely a retry that succeeded on the first attempt.
      // We silently attempt to log in to verify.
      if (err.message?.toLowerCase().includes("exists")) {
        try {
          const loginData = await login(username, password);
          if (loginData.token)
            await AsyncStorage.setItem("token", loginData.token);
          const userId =
            loginData.user?._id || loginData.user?.id || loginData.id;
          if (userId) await AsyncStorage.setItem("userId", userId);
          onAuthSuccess();
          return; // Exit successfully
        } catch (loginErr) {
          // If login also fails, the email really does belong to someone else.
        }
      }
      const msg = err.message || "Something went wrong";
      setErrorMsg(msg);
    } finally {
      clearTimeout(wakeUpTimer);
      if (countdownInterval) clearInterval(countdownInterval);
      setIsWakingUp(false);
      fadeAnim.setValue(0);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isWakingUp && (
        <Animated.View style={[styles.wakeCard, { opacity: fadeAnim }]}>
          <Text style={styles.wakeText}>Waking up backend server...</Text>
          <Text style={{ color: "#fff", fontSize: 12, marginTop: 4 }}>
            {secondsRemaining > 0
              ? `Usually takes ~${secondsRemaining}s`
              : "Almost there! Still connecting..."}
          </Text>
        </Animated.View>
      )}

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6c757d"
        value={username}
        onChangeText={handleUsernameChange}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6c757d"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6c757d"
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry
      />

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading ? { opacity: 0.7 } : {}]}
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
  wakeText: { color: "#fff", fontSize: 16, fontWeight: "500" },
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
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  switchText: { marginTop: 20, color: "#007bff", textAlign: "center" },
  errorText: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
});
