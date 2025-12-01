import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function ProcessingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0066FF" />
      <Text style={styles.txt}>Analyzing handwriting… Please wait</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "white",
  },
  txt: {
    marginTop: 20, fontSize: 18, color: "#333",
  },
});
