import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const result = JSON.parse(params.result);
  const report = JSON.parse(result.report);
  const student = JSON.parse(params.student);
  const preview = params.previewUri;
  const filename = params.filename;
  const dt = new Date().toLocaleString();

  async function onShare() {
    await Share.share({
      message: `Handwriting Report\n${student.name}\n${dt}\n`,
      url: preview,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <View>
          <Text style={styles.name}>{student.name}</Text>
          <Text style={styles.meta}>{dt}</Text>
          <Text style={styles.meta}>{filename}</Text>
        </View>
        <Image source={{ uri: preview }} style={styles.thumb} />
      </View>

      <Image source={{ uri: preview }} style={styles.largePreview} />

      <View style={styles.card}>
        <Text style={styles.section}>Scores</Text>

        <View style={styles.row}><Text>Neatness</Text><Text>{report.neatness.score}/10</Text></View>
        <View style={styles.row}><Text>Spacing</Text><Text>{report.spacing.score}/10</Text></View>
        <View style={styles.row}><Text>Slant</Text><Text>{report.slant.score}/10</Text></View>
        <View style={styles.row}><Text>Consistency</Text><Text>{report.consistency.score}/10</Text></View>
        <View style={styles.row}><Text>Letter Consistency</Text><Text>{report.letter_consistency.score}/10</Text></View>

        <Text style={styles.section}>Overall Comment</Text>
        <Text>{report.overall_comment}</Text>

        <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
          <Text style={{ color: "white", fontSize: 18 }}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14 },
  topCard: {
    flexDirection: "row", justifyContent: "space-between",
    padding: 16, backgroundColor: "#fff",
    borderRadius: 10, elevation: 3,
  },
  name: { fontSize: 22, fontWeight: "bold" },
  meta: { color: "#555", marginTop: 4 },
  thumb: {
    width: 80, height: 80, borderRadius: 8,
    borderWidth: 1, borderColor: "#aaa",
  },
  largePreview: {
    width: "100%", height: 240,
    marginTop: 14, borderRadius: 10,
  },
  card: {
    marginTop: 16, backgroundColor: "#fff",
    padding: 16, borderRadius: 12, elevation: 3,
  },
  section: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  row: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 6, borderBottomWidth: 1, borderColor: "#eee",
  },
  shareBtn: {
    backgroundColor: "#0066FF",
    padding: 14, marginTop: 20, borderRadius: 10, alignItems: "center",
  },
});
