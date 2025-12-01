import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import student from "../assets/student.json";

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.line}>Age: {student.age}</Text>
        <Text style={styles.line}>Class: {student.class}</Text>
        <Text style={styles.line}>Roll No: {student.roll}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          router.push({
            pathname: "/CameraScreen",
            params: { student: JSON.stringify(student) },
          })
        }
      >
        <Text style={styles.btnText}>Start Handwriting Scanner</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#F5F7FA", padding: 20,
  },
  card: {
    width: "90%", padding: 20, backgroundColor: "#fff",
    borderRadius: 12, elevation: 4, marginBottom: 40,
  },
  name: { fontSize: 26, fontWeight: "bold" },
  line: { fontSize: 18, marginTop: 4, color: "#333" },
  btn: {
    backgroundColor: "#0066FF", paddingVertical: 16,
    paddingHorizontal: 40, borderRadius: 12, elevation: 3,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});