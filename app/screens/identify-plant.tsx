import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Camera, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function IdentifyPlantScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();

  const takePhoto = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }
    }

    try {
      const result = await Camera.requestCameraPermissionsAsync();
      if (result.status === 'granted') {
        const pickerResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!pickerResult.canceled) {
          setImage(pickerResult.assets[0].uri);
          identifyPlant(pickerResult.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    if (!galleryPermission?.granted) {
      const permission = await requestGalleryPermission();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Gallery access is needed to select photos.');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        identifyPlant(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const identifyPlant = async (imageUri: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual plant identification API call
      // This is a placeholder for plant identification logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Mock result for demonstration
      const mockResult = {
        name: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        confidence: 0.85,
        careInstructions: 'Bright, indirect light. Water when top inch of soil is dry.',
        commonIssues: ['Overwatering', 'Low humidity']
      };

      Alert.alert(
        'Plant Identified', 
        `${mockResult.name} (${mockResult.scientificName})\nConfidence: ${(mockResult.confidence * 100).toFixed(2)}%`, 
        [{
          text: 'View Details',
          onPress: () => Alert.alert('Care Instructions', mockResult.careInstructions)
        }]
      );
    } catch (error) {
      console.error('Plant identification error:', error);
      Alert.alert('Identification Failed', 'Unable to identify the plant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Identifier une Plante</Text>
          <Text style={styles.subtitle}>Prenez une photo ou sélectionnez une image</Text>
        </View>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="white" style={styles.loader} />
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Prendre une Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={pickFromGallery}
            >
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Choisir de la Galerie</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});