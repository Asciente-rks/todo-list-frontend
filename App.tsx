import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TodoScreen } from "./src/screens/TodoScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

const BACKEND_URL = "https://todo-list-backend-4li8.onrender.com/api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>(
    "Checking backend...",
  );

  useEffect(() => {
    // 🔹 Retry backend check for Render cold start
    const checkBackend = async (retries = 5, delay = 3000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(BACKEND_URL);
          const data = await res.json();
          setBackendStatus("Backend online ✅");
          console.log("FETCH TEST SUCCESS:", data);
          return true;
        } catch (err: any) {
          console.log(`FETCH TRY ${i + 1} FAILED:`, err.message);
          setBackendStatus(`Backend waking up... attempt ${i + 1}`);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
      setBackendStatus("Backend unreachable ❌");
      return false;
    };

    // 🔹 Step 1: Check backend
    checkBackend();

    // 🔹 Step 2: Check auth token
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

  // 🔹 Show backend status while unauthenticated
  if (!isAuthenticated) {
    if (isRegistering) {
      return (
        <RegisterScreen
          onAuthSuccess={() => setIsAuthenticated(true)}
          onSwitchToLogin={() => setIsRegistering(false)}
        />
      );
    }
    return (
      <View style={styles.container}>
        <LoginScreen
          onAuthSuccess={() => setIsAuthenticated(true)}
          onSwitchToRegister={() => setIsRegistering(true)}
        />
        <Text style={styles.status}>{backendStatus}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <TodoScreen onLogout={() => setIsAuthenticated(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  status: { textAlign: "center", padding: 10, color: "#555" },
});
