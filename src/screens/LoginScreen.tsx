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
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../api/authService";
import apiClient from "../api/client";
import { WakeUpNotice } from "../components/WakeUpNotice";
import { theme } from "../theme";

interface Props {
  onAuthSuccess: () => void;
  onSwitchToRegister: () => void;
}

export const LoginScreen = ({ onAuthSuccess, onSwitchToRegister }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0]; // fade-in animation

  // Optional: ping backend once on mount
  useEffect(() => {
    apiClient.get("").catch(() => {});
  }, []);

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    if (errorMsg) setErrorMsg(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMsg) setErrorMsg(null);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }

    setErrorMsg(null);
    setLoading(true);
    setIsWakingUp(false);

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

      // ✅ Success
      onAuthSuccess();
    } catch (err: any) {
      const msg = err.message || "Invalid username or password";
      setErrorMsg(msg);
    } finally {
      clearTimeout(wakeUpTimer);
      setIsWakingUp(false);
      fadeAnim.setValue(0);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundBlobOne} />
      <View style={styles.backgroundBlobTwo} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={styles.logoShell}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.kicker}>TaskFlow</Text>
            <Text style={styles.brandTitle}>Plan less. Finish more.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to keep your tasks, reminders, and progress in one place.
          </Text>

          {isWakingUp && (
            <Animated.View style={[styles.noticeWrap, { opacity: fadeAnim }]}>
              <WakeUpNotice />
            </Animated.View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#8A93A3"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A93A3"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading ? styles.buttonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSwitchToRegister}
            style={styles.linkWrap}
          >
            <Text style={styles.switchText}>
              Don't have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDeep,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingVertical: 32,
  },
  backgroundBlobOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 240,
    backgroundColor: "rgba(37,99,235,0.24)",
    top: -70,
    right: -90,
  },
  backgroundBlobTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: "rgba(22,163,74,0.16)",
    bottom: -60,
    left: -70,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  logoShell: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    padding: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  brandCopy: {
    flex: 1,
  },
  kicker: {
    color: "#9FB3D9",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: theme.radius.xl,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    color: theme.colors.text,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  noticeWrap: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceSoft,
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.accentStrong,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkWrap: {
    marginTop: 18,
  },
  switchText: {
    color: theme.colors.accentStrong,
    textAlign: "center",
    fontWeight: "600",
  },
  errorText: {
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
});
