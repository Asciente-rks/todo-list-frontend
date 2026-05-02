import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertCircle } from "lucide-react-native";

export const WakeUpNotice = () => {
  return (
    <View style={styles.notice}>
      <View style={styles.iconWrap}>
        <AlertCircle size={16} color="#2563EB" />
      </View>
      <Text style={styles.text}>
        System is deployed on Render, waking up might take 60 seconds.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.14)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#DCE7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    color: "#102033",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});
