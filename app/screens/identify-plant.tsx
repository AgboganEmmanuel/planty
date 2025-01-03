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
  commonNames?: string[];
  family?: string;
  genus?: string;
  images?: string[];
}

export default function IdentifyPlantScreen() {
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [plantResults, setPlantResults] = useState<PlantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

 /* // Get Hugging Face token from Expo config
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
  };*/

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

  /*const identifyPlant = async () => {
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
    }*/

      const identifyPlant = async () => {
        // Get PlantNet API key, endpoint, and project from Expo config
        const PLANTNET_API_KEY = Constants.expoConfig?.extra?.PLANTNET_API_KEY;
        const PLANTNET_API_PROJECT = Constants.expoConfig?.extra?.PLANTNET_API_PROJECT || 'all';
        const PLANTNET_API_ENDPOINT = Constants.expoConfig?.extra?.PLANTNET_API_ENDPOINT || 'https://my-api.plantnet.org/v2/identify';
      
        if (!plantImage || !PLANTNET_API_KEY) {
          console.error('Error', 'No image or API key');
          return;
        }
      
        setIsLoading(true);
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('images', {
            uri: plantImage,
            type: 'image/jpeg',
            name: 'plant.jpg'
          } as any);
      
          // Log full API request details for debugging
          console.log('API Endpoint:', PLANTNET_API_ENDPOINT);
          console.log('API Project:', PLANTNET_API_PROJECT);
          console.log('API Key:', PLANTNET_API_KEY ? 'Present' : 'Missing');
      
          // PlantNet API request
          const fullUrl = `${PLANTNET_API_ENDPOINT}/${PLANTNET_API_PROJECT}?api-key=${PLANTNET_API_KEY}`;
          console.log('Full API URL:', fullUrl);
      
          const response = await fetch(fullUrl, 
            {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            }
          );
      
          // Log response details
          console.log('Response Status:', response.status);
          console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error Response Body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
          }
      
          const data = await response.json();
      
          // Validate and transform PlantNet results
          const results = data.results?.map((result: any) => {
            // Detailed logging for debugging
            console.log('Raw PlantNet Result:', JSON.stringify(result, null, 2));
            
            return {
              label: result.species?.scientificName || 'Unknown Species',
              score: result.score || 0,
              commonNames: result.species?.commonNames || [],
              family: result.species?.family?.scientificName || 'Unknown Family',
              genus: result.species?.genus?.scientificName || 'Unknown Genus',
              images: result.images?.map((img: any) => img.url?.m).filter(Boolean) || []
            };
          }) || [];
      
          // Log transformed results for verification
          console.log('Transformed Results:', JSON.stringify(results, null, 2));
      
          // Sort and limit results
          const sortedResults = results
            .filter((result: PlantResult) => result.score > 0)
            .sort((a: PlantResult, b: PlantResult) => b.score - a.score)
            .slice(0, 1);  // Only take the top result
      
          setPlantResults(sortedResults);
        } catch (error) {
          console.error('Plant identification error:', error);
          // More informative error handling
          if (error instanceof Error) {
            console.error('Error details:', error.message);
          }
          console.error('Error', 'Failed to identify plant');
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
              <View style={styles.resultItem}>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultLabel}>
                    {plantResults[0].label}
                  </Text>
                  {plantResults[0].commonNames && plantResults[0].commonNames.length > 0 && (
                    <Text style={styles.resultCommonName}>
                      {plantResults[0].commonNames[0]}
                    </Text>
                  )}
                </View>
                <View style={styles.resultDetailsContainer}>
                  <Text style={styles.resultScore}>
                    Confidence: {(plantResults[0].score * 100).toFixed(2)}%
                  </Text>
                  {plantResults[0].family && (
                    <Text style={styles.resultFamily}>
                      Family: {plantResults[0].family}
                    </Text>
                  )}
                </View>
                {plantResults[0].images && plantResults[0].images.length > 0 && (
                  <View style={styles.resultImageContainer}>
                    <Image 
                      source={{ uri: plantResults[0].images[0] }} 
                      style={styles.resultImage} 
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
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
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignSelf: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 15,
  },
  resultTextContainer: {
    flex: 2,
    marginRight: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCommonName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 5,
  },
  resultDetailsContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultScore: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  resultFamily: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  resultImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
});