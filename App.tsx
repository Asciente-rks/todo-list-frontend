// App.tsx
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { TodoScreen } from "./src/screens/TodoScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const clearStaleSession = async () => {
      await AsyncStorage.multiRemove(["token", "userId"]);
      setIsAuthenticated(false);
      setIsRegistering(false);
    };

    clearStaleSession().catch(() => {
      setIsAuthenticated(false);
      setIsRegistering(false);
    });
  }, []);

  // Render authentication screens
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

  // Render main Todo screen when authenticated
  return <TodoScreen onLogout={() => setIsAuthenticated(false)} />;
}
