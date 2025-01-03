import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView 
} from 'react-native';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { HfInference } from '@huggingface/inference';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PlantResult {
  label: string;
  score: number;
}

export default function IdentifyPlantScreen() {
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [plantResults, setPlantResults] = useState<PlantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get Hugging Face token from Expo config
  const HUGGING_FACE_TOKEN = Constants.expoConfig?.extra?.HUGGING_FACE_TOKEN;
  const hf = new HfInference(HUGGING_FACE_TOKEN || '');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPlantImage(result.assets[0].uri);
        setPlantResults([]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPlantImage(result.assets[0].uri);
        setPlantResults([]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const identifyPlant = async () => {
    if (!plantImage || !HUGGING_FACE_TOKEN) return;

    setIsLoading(true);
    try {
      // Fetch image as blob
      const response = await fetch(plantImage);
      const blob = await response.blob();

      // Perform image classification
      const results = await hf.imageClassification({
        data: blob,
        model: 'google/vit-base-patch16-224',
      });
      console.log(results);
      // Sort and limit results
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setPlantResults(sortedResults);
    } catch (error) {
      console.error('Plant identification error:', error);
      // Optionally, show an error to the user
      setPlantResults([]);
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Plant Identifier</Text>
          
          {/* Image Preview Area */}
          <View style={styles.imageContainer}>
            {plantImage ? (
              <Image 
                source={{ uri: plantImage }} 
                style={styles.image} 
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Ionicons 
                  name="leaf-outline" 
                  size={100} 
                  color="rgba(255,255,255,0.5)" 
                />
                <Text style={styles.placeholderText}>
                  No image selected
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                (!plantImage || isLoading) && styles.buttonDisabled
              ]} 
              onPress={identifyPlant}
              disabled={!plantImage || isLoading}
            >
              <Ionicons name="search-outline" size={24} color="white" />
              <Text style={styles.buttonText}>
                {isLoading ? 'Identifying...' : 'Identify'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results Area */}
          {plantResults.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Identification Results</Text>
              {plantResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultLabel}>
                    {result.label}
                  </Text>
                  <Text style={styles.resultScore}>
                    {(result.score * 100).toFixed(2)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
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
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    marginTop: 10,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
  resultsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
  },
  resultsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    color: 'white',
    fontSize: 16,
  },
  resultScore: {
    color: 'white',
    fontWeight: 'bold',
  },
});