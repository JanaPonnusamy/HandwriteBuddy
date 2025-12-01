import axios from 'axios';
import * as ImageManipulator from 'expo-image-manipulator';

// REPLACE WITH YOUR PC IP — NOT LOCALHOST
const SERVER_URL = "http://localhost:3000";

export async function uploadHandwriting(imageUri) {

  const compressed = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 1200 } }],
    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );

  const form = new FormData();
  form.append("photo", {
    uri: compressed.uri,
    name: "handwriting.jpg",
    type: "image/jpeg",
  });

  const res = await axios.post(`${SERVER_URL}/analyze-handwriting`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });

  return res.data;
}
