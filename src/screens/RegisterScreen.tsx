import React, { useState } from "react";
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

interface Props {
  onAuthSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterScreen = ({ onAuthSuccess, onSwitchToLogin }: Props) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !username)
      return Alert.alert("Error", "Please fill in all fields");
    setLoading(true);
    try {
      await register(email, password, username);
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please log in with your credentials.",
        [{ text: "OK", onPress: onSwitchToLogin }],
      );
    } catch (error: any) {
      // Improved error visibility for debugging APKs
      const backendError =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.error ||
        error.message ||
        "Could not create account";
      Alert.alert("Registration Failed", backendError);
    } finally {
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
