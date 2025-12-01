import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  const params = useLocalSearchParams();
  const student = JSON.parse(params.student || "{}");

  const [zoom, setZoom] = useState(0);
  const [flash, setFlash] = useState("off");
  const [brightness, setBrightness] = useState(0.0);
  const [resolution, setResolution] = useState("low");

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ color: "white", fontSize: 18 }}>Camera Permission Needed</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={{ color: "white" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePhoto() {
    try {
      if (!cameraRef.current) {
        console.log("Camera null");
        return;
      }

      console.log("CLICKED → Capturing...");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: false,
      });

      console.log("PHOTO CAPTURED:", photo.uri);

      router.push({
        pathname: "/PreviewScreen",
        params: {
          photo: JSON.stringify(photo),
          resolution,
          student: JSON.stringify(student),
        },
      });
    } catch (err) {
      console.log("CAPTURE ERROR:", err);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="picture"               // VERY IMPORTANT
        facing="back"
        flash={flash}
        zoom={zoom}
      />

      <View style={[styles.brightOverlay, { opacity: brightness }]} />

      <View style={styles.frameBox} pointerEvents="none" />

      {/* RESOLUTION BUTTONS */}
      <View style={styles.resPanel}>
        {["low", "med", "high"].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setResolution(r)}
            style={[styles.resBtn, resolution === r && styles.resBtnActive]}
          >
            <Text style={{ color: "white" }}>{r.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FLASH */}
      <View style={styles.flashWrap}>
        <TouchableOpacity
          onPress={() =>
            setFlash(flash === "off" ? "on" : flash === "on" ? "auto" : "off")
          }
        >
          <Ionicons
            name={flash === "off" ? "flash-off" : flash === "on" ? "flash" : "cloud-outline"}
            size={32}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* ZOOM */}
      <View style={styles.zoomPanel}>
        <Text style={styles.label}>Zoom</Text>
        <Slider value={zoom} onValueChange={setZoom} minimumValue={0} maximumValue={1} />
      </View>

      {/* BRIGHTNESS */}
      <View style={styles.brightPanel}>
        <Text style={styles.label}>Brightness</Text>
        <Slider
          value={brightness}
          onValueChange={setBrightness}
          minimumValue={0}
          maximumValue={0.4}
        />
      </View>

      {/* SHUTTER BUTTON */}
      <View style={styles.shutterWrap}>
        <TouchableOpacity style={styles.shutterOuter} onPress={takePhoto}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  frameBox: {
    position: "absolute",
    top: "20%",
    left: "10%",
    width: "80%",
    height: "55%",
    borderWidth: 3,
    borderColor: "#00E0FF",
    borderRadius: 12,
    zIndex: 20,
  },
  brightOverlay: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "white",
    zIndex: 1,
  },
  resPanel: {
    position: "absolute",
    top: 40,
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 8,
    zIndex: 30,
  },
  resBtn: { padding: 6, paddingHorizontal: 12, marginHorizontal: 4 },
  resBtnActive: { backgroundColor: "#00E0FF", borderRadius: 6 },
  flashWrap: { position: "absolute", top: 120, right: 20, zIndex: 40 },
  zoomPanel: { position: "absolute", bottom: 160, width: "80%", alignSelf: "center" },
  brightPanel: { position: "absolute", bottom: 110, width: "80%", alignSelf: "center" },
  label: { color: "white", marginBottom: 6 },
  shutterWrap: { position: "absolute", bottom: 30, alignSelf: "center" },
  shutterOuter: {
    width: 85, height: 85, borderRadius: 60,
    borderWidth: 6, borderColor: "white",
    justifyContent: "center", alignItems: "center",
  },
  shutterInner: {
    width: 60, height: 60, borderRadius: 50, backgroundColor: "white",
  },
  permissionContainer: {
    flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center",
  },
  permissionBtn: {
    backgroundColor: "#0066FF", padding: 12, borderRadius: 10, marginTop: 20,
  },
});
