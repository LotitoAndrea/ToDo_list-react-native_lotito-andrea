// Allegato immagine alla card

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface Props {
  imageUri: string | null;
  onChangeImage: (uri: string | null) => void;
}

export default function ImageAttachment({ imageUri, onChangeImage }: Props) {
  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Consenti l\'accesso alla galleria nelle impostazioni.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!result.canceled && result.assets[0]) {
      onChangeImage(result.assets[0].uri);
    }
  }

  function handleRemove() {
    Alert.alert('Rimuovi immagine', 'Vuoi rimuovere l\'immagine allegata?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Rimuovi', style: 'destructive', onPress: () => onChangeImage(null) },
    ]);
  }

  if (imageUri) {
    return (
      <View>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
            <Text style={styles.actionBtnText}>🔄 Sostituisci</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleRemove}>
            <Text style={[styles.actionBtnText, styles.actionBtnTextDanger]}>🗑️ Rimuovi</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.placeholder} onPress={pickImage}>
      <Text style={styles.placeholderIcon}>🖼️</Text>
      <Text style={styles.placeholderText}>Aggiungi immagine</Text>
      <Text style={styles.placeholderHint}>Tocca per scegliere dalla galleria</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#EBECF0',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  actionBtnDanger: {
    backgroundColor: '#FFEBEE',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5E6C84',
  },
  actionBtnTextDanger: {
    color: '#F44336',
  },
  placeholder: {
    borderWidth: 2,
    borderColor: '#C1C7D0',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F4F5F7',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5E6C84',
  },
  placeholderHint: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },
});
