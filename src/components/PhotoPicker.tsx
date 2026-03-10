import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/utils/colors';

interface PhotoPickerProps {
  photos: string[];
  onAdd: (localUri: string) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export default function PhotoPicker({ photos, onAdd, onRemove, disabled }: PhotoPickerProps) {
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      onAdd(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      onAdd(result.assets[0].uri);
    }
  }

  function handleAdd() {
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {photos.map((uri, i) => (
        <View key={uri + i} style={styles.photoWrapper}>
          <Image source={{ uri }} style={styles.photo} />
          {!disabled && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(i)}
            >
              <Ionicons name="close-circle" size={20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {!disabled && (
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Ionicons name="camera-outline" size={26} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexDirection: 'row',
  },
  photoWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.surface,
    borderRadius: 10,
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});
