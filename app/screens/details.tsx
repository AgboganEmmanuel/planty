import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function PlantDetailsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { 
    plantId, 
    plantName, 
    species, 
    imageUrl, 
    identificationDate,
    additionalNotes,
    information
  } = useLocalSearchParams();

  const parsedAdditionalNotes = additionalNotes 
    ? JSON.parse(additionalNotes as string) 
    : {};

  const handleDeletePlant = async () => {
    // Confirm deletion
    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete plant from Supabase
              const { error } = await supabase
                .from('plants')
                .delete()
                .eq('id', plantId);

              if (error) throw error;

              // Navigate back to my plants screen
              router.replace('/screens/my-plants');
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Could not delete the plant');
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Plant Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl as string }} 
              style={styles.plantImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Plant Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.plantName}>{plantName}</Text>
          <Text style={styles.plantSpecies}>{species}</Text>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Identification Details</Text>
            <Text style={styles.infoText}>
              Identified on: {new Date(identificationDate as string).toLocaleDateString()}
            </Text>
          </View>

          {/* Additional Notes */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Identification Information</Text>
            <Text style={styles.infoText}>
              Confidence: {parsedAdditionalNotes.confidence || 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              Family: {parsedAdditionalNotes.family || 'N/A'}
            </Text>
            <Text style={styles.infoText}>
              Genus: {parsedAdditionalNotes.genus || 'N/A'}
            </Text>
          </View>

          {/* Plant Information */}
          {information && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>About This Plant</Text>
              <Text style={styles.infoText}>
                {information}
              </Text>
            </View>
          )}

          {/* Delete Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeletePlant}
          >
            <Ionicons name="trash" size={24} color="white" />
            <Text style={styles.deleteButtonText}>
              Delete Plant
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  plantImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  placeholderImage: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    flex: 1,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  plantSpecies: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
});