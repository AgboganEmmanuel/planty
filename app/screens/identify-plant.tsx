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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, deviceId } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getPlantInformation } from '../lib/huggingface';
import { createNotification as createNotificationImport, CreateNotificationParams } from '../screens/notifications';

// Créer une copie de la fonction pour éviter les problèmes de contexte
const createNotification = async (params: CreateNotificationParams) => {
  return await createNotificationImport(params);
};


interface PlantResult {
  label: string;
  score: number;
  commonNames?: string[];
  family?: string;
  genus?: string;
  images?: string[];
}

interface PlantIdentificationData {
  name: string;
  species: string;
  imageUrl: string;
  notes?: string;
}

export default function IdentifyPlantScreen() {
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [plantResults, setPlantResults] = useState<PlantResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

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

  const savePlantIdentification = async (plantResult: PlantResult) => {
    if (!session?.user) {
      console.error('Erreur', 'Vous devez être connecté pour enregistrer une identification');
      return null;
    }
    
    if (!plantResult) {
      console.error('Erreur', 'Aucun résultat d\'identification disponible');
      return null;
    }
    
    try {
      // Obtenir les informations sur la plante
      const plantInformation = await getPlantInformation(
        plantResult.commonNames?.[0] || plantResult.label, 
        plantResult.label
      );
      
      // Préparer les données de la plante à enregistrer
      const plantToSave = {
        user_id: session.user.id,
        plant_name: plantResult.commonNames && plantResult.commonNames.length > 0 
          ? plantResult.commonNames[0] 
          : plantResult.label,
        species: plantResult.label,
        image_url: plantResult.images && plantResult.images.length > 0 
          ? plantResult.images[0] 
          : plantImage,
        additional_notes: JSON.stringify({
          confidence: (plantResult.score * 100).toFixed(2) + '%',
          family: plantResult.family || 'Non spécifié',
          genus: plantResult.genus || 'Non spécifié',
          scientificName: plantResult.label
        }),
        information: plantInformation || 'No additional information available',
        identification_date: new Date().toISOString()
      };
      
      // Enregistrer la plante dans Supabase
      const { data, error } = await supabase
        .from('plants')
        .insert(plantToSave)
        .select(); // Retourner l'enregistrement inséré
      
      if (error) {
        console.error('Erreur lors de la sauvegarde de la plante:', error);
        return null;
      }
      
    /*  // Créer une notification pour la nouvelle identification
      if (data && data[0]) {
        try {
          console.log('DEBUG: Données de la plante', data[0]);
          console.log('DEBUG: Session utilisateur', session);

          // Vérifier que la fonction est bien importée
          console.log('DEBUG: Type de createNotification:', typeof createNotification);
          console.log('DEBUG: Contenu de createNotification:', createNotification);

          if (typeof createNotification !== 'function') {
            console.error('DEBUG: createNotification is not a function');
            throw new Error('createNotification is not a function');
          }

          const notificationParams: CreateNotificationParams = {
            userId: session.user.id,
            type: 'new_identification',
            plantId: data[0].id,
            message: `Nouvelle plante identifiée : ${plantToSave.plant_name}`
          };
          
          console.log('DEBUG: Paramètres de notification', notificationParams);
          
          const notificationResult = await createNotification(notificationParams);
          
          console.log('DEBUG: Résultat de la notification:', notificationResult);

          if (!notificationResult) {
            console.error('DEBUG: La création de notification a échoué');
          }
        } catch (notificationError) {
          console.error('Erreur lors de la création de la notification:', notificationError);
          // Afficher la pile d'appel complète
          console.error(notificationError instanceof Error ? notificationError.stack : 'No stack trace');
        }
      }*/

      // Message de succès
      console.log('Succès', 'Plante identifiée et enregistrée');
      
      return data ? data[0] : null;
    } catch (error) {
      console.error('Erreur inattendue lors de l\'identification de la plante:', error);
      return null;
    }
  };

  const fetchUserPlants = async () => {
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching plants:', error);
      return [];
    }

    return data;
  };

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
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Validate and transform PlantNet results
      const results = data.results?.map((result: any) => {
        return {
          label: result.species?.scientificName || 'Unknown Species',
          score: result.score || 0,
          commonNames: result.species?.commonNames || [],
          family: result.species?.family?.scientificName || 'Unknown Family',
          genus: result.species?.genus?.scientificName || 'Unknown Genus',
          images: result.images?.map((img: any) => img.url?.m).filter(Boolean) || []
        };
      }) || [];
  
      // Sort and limit results
      const sortedResults = results
        .filter((result: PlantResult) => result.score > 0)
        .sort((a: PlantResult, b: PlantResult) => b.score - a.score)
        .slice(0, 1);
  
      setPlantResults(sortedResults);
  
      // Save the identified plant
      if (sortedResults.length > 0) {
        await savePlantIdentification(sortedResults[0]);
      }
    } catch (error) {
      console.error('Plant identification error:', error);
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
                  {plantResults[0].commonNames && plantResults[0].commonNames.length > 0 && (
                    <Text style={styles.resultCommonName}>
                      {plantResults[0].commonNames[0]}
                    </Text>
                  )}
                  <Text style={styles.resultLabel}>
                    {plantResults[0].label}
                  </Text>
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 5, 
  },
  resultCommonName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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