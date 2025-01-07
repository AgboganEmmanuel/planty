import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

interface SavedPlant {
  id: string;
  plant_name: string;
  species: string;
  image_url?: string | null;
  additional_notes?: string | null;
  identification_date: string;
  information?: string;
}

export default function MyPlantsScreen() {
  const { session } = useAuth();
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchUserPlants = useCallback(async () => {
    if (!session?.user) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour voir vos plantes');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', session.user.id)
        .order('identification_date', { ascending: false });

      if (error) throw error;

      setPlants(data || []);
    } catch (err) {
      console.error('Erreur de récupération des plantes:', err);
      Alert.alert('Erreur', 'Impossible de charger vos plantes');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchUserPlants();
  }, [fetchUserPlants]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserPlants();
  }, [fetchUserPlants]);

  const renderPlantItem = ({ item }: { item: SavedPlant }) => (
    <TouchableOpacity 
      style={styles.plantCard}
      onPress={() => router.push({
        pathname: '/screens/details',
        params: { 
          plantId: item.id,
          plantName: item.plant_name,
          species: item.species,
          imageUrl: item.image_url || '',
          identificationDate: item.identification_date,
          additionalNotes: item.additional_notes || '',
          information: item.information || ''
        }
      })}
    >
      {item.image_url ? (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.plantImage} 
          resizeMode="cover" 
        />
      ) : (
        <View style={styles.placeholderImage} />
      )}
      
      <View style={styles.plantDetails}>
        <Text style={styles.plantName} numberOfLines={1}>
          {item.plant_name}
        </Text>
        <Text style={styles.plantSpecies} numberOfLines={1}>
          {item.species}
        </Text>
        <Text style={styles.plantDate}>
          {new Date(item.identification_date).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Plants</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading plants...</Text>
      ) : plants.length > 0 ? (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.plantListContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ffffff']}
              tintColor="#ffffff"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No plants found</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  plantListContainer: {
    paddingHorizontal: 20,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  plantImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  plantDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  plantSpecies: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  plantDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
});