import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TodoScreen } from "./src/screens/TodoScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

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
      <LoginScreen
        onAuthSuccess={() => setIsAuthenticated(true)}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <TodoScreen onLogout={() => setIsAuthenticated(false)} />
    </>
  );
}
