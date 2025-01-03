import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SavedPlant {
  id: string;
  plant_name: string;
  species: string;
  image_url?: string | null;
  additional_notes?: string | null;
  identification_date: string;
}

export default function MyPlantsScreen() {
  const { session } = useAuth();
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const removePlant = async (plantId: string) => {
    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      setPlants(currentPlants => 
        currentPlants.filter(plant => plant.id !== plantId)
      );

      Alert.alert('Succès', 'Plante supprimée avec succès');
    } catch (err) {
      console.error('Erreur de suppression de plante:', err);
      Alert.alert('Erreur', 'Impossible de supprimer la plante');
    }
  };

  const renderPlantItem = ({ item }: { item: SavedPlant }) => (
    <View style={styles.plantCard}>
      {item.image_url && (
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.plantImage} 
        />
      )}
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.plant_name}</Text>
        <Text style={styles.plantSpecies}>{item.species}</Text>
        <Text style={styles.plantDate}>
          Ajoutée le: {new Date(item.identification_date).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient 
        colors={['#2ecc71', '#27ae60']} 
        style={styles.container}
      >
        <Text style={styles.loadingText}>Chargement de vos plantes...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      {plants.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Aucune plante identifiée pour le moment. Commencez à identifier vos plantes !
          </Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ffffff']}
              tintColor="#ffffff"
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  plantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  plantSpecies: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  plantNotes: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
  },
  plantDate: {
    fontSize: 12,
    color: 'white',
    opacity: 0.6,
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: 'rgba(255,0,0,0.3)',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});