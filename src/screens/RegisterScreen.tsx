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
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register, login } from "../api/authService";
import apiClient from "../api/client";
import { WakeUpNotice } from "../components/WakeUpNotice";
import { theme } from "../theme";

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

    const wakeUpTimer = setTimeout(() => {
      setIsWakingUp(true);
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
              source={require("../../assets/adaptive-icon.png")}
              style={styles.logo}
            />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.kicker}>TaskFlow</Text>
            <Text style={styles.brandTitle}>Set up your workspace.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Build a simple home for your tasks and keep your day moving.
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
            placeholder="Email"
            placeholderTextColor="#8A93A3"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            keyboardType="email-address"
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onSwitchToLogin} style={styles.linkWrap}>
            <Text style={styles.switchText}>
              Already have an account? Login
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
    backgroundColor: theme.colors.success,
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
