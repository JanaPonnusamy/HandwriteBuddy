import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImageManipulator from "expo-image-manipulator";
import { validateImage, uploadHandwriting } from "../src/api";

export default function PreviewScreen() {
  const params = useLocalSearchParams();
  const photo = JSON.parse(params.photo);
  const student = JSON.parse(params.student);
  const [resolution, setResolution] = useState(params.resolution || "low");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState(null);

  async function runValidation() {
    setLoading(true);

    const width =
      resolution === "low" ? 600 : resolution === "med" ? 900 : 1500;
    const quality =
      resolution === "low" ? 0.35 : resolution === "med" ? 0.45 : 0.6;

    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    const result = await validateImage(compressed.uri);

    setInfo({
      compressedUri: compressed.uri,
      originalUri: photo.uri,
      compressedSize: result.compressedSize,
      valid: result.valid,
      reason: result.reason,
      estimated_cost: result.estimated_cost_usd,
    });

    setLoading(false);
  }

  async function uploadNow() {
    if (!info?.valid) {
      Alert.alert("Invalid Image", info?.reason || "Try retaking the photo.");
      return;
    }

    router.push("/ProcessingScreen");

    const result = await uploadHandwriting(info.compressedUri);

    router.replace({
      pathname: "/ResultScreen",
      params: {
        result: JSON.stringify(result),
        student: JSON.stringify(student),
        previewUri: info.compressedUri,
        filename: photo.uri.split("/").pop(),
      },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preview</Text>

      <Image source={{ uri: photo.uri }} style={styles.preview} />

      <View style={styles.resRow}>
        {["low", "med", "high"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.resBtn, resolution === r && styles.resBtnActive]}
            onPress={() => setResolution(r)}
          >
            <Text style={styles.resTxt}>{r.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#ddd" }]}
            onPress={() => router.back()}
          >
            <Text>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={runValidation}>
            <Text style={styles.btnTxt}>Check Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {info && (
        <View style={styles.card}>
          <Text>Compressed Size: {info.compressedSize} bytes</Text>
          <Text>Status: {info.valid ? "Valid" : "Invalid"}</Text>
          {info.reason && <Text>Reason: {info.reason}</Text>}
          <Text>
            Estimated Cost: ₹{(info.estimated_cost * 89.5).toFixed(2)}
          </Text>

          {info.valid && (
            <TouchableOpacity style={styles.uploadBtn} onPress={uploadNow}>
              <Text style={styles.uploadTxt}>Upload & Analyze</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  preview: {
    width: "100%", height: 350, borderRadius: 12,
    borderWidth: 2, borderColor: "#ccc",
  },
  resRow: {
    flexDirection: "row", alignSelf: "center",
    marginTop: 12, marginBottom: 12,
  },
  resBtn: {
    padding: 6, paddingHorizontal: 14,
    backgroundColor: "#eee", marginHorizontal: 6,
    borderRadius: 8,
  },
  resBtnActive: { backgroundColor: "#0066FF" },
  resTxt: { color: "#000" },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  btn: {
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 10, backgroundColor: "#0066FF",
  },
  btnTxt: { color: "white", fontWeight: "600" },
  card: {
    marginTop: 20, backgroundColor: "#fff",
    padding: 16, borderRadius: 10, elevation: 3,
  },
  uploadBtn: {
    backgroundColor: "#00AA00", padding: 14,
    marginTop: 12, borderRadius: 10,
  },
  uploadTxt: { color: "white", textAlign: "center", fontWeight: "600" },
});
