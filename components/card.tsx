import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { supabase } from '../app/lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

// Screen width for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Plant {
  id: string;
  plant_name: string;
  species: string;
  image_url?: string | null;
  identification_date: string;
}

export default function PlantCard() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    fetchUserPlants();
  }, [session]);

  const fetchUserPlants = async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', session.user.id)
        .order('identification_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlantCard = ({ item }: { item: Plant }) => (
    <TouchableOpacity style={styles.plantCard}>
      <LinearGradient
        colors={['rgba(34 33 33 / 0.2)', 'rgba(0 0 0 / 0.1)']}
        style={styles.cardGradient}
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
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Plants</Text>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Loading plants...</Text>
      ) : plants.length > 0 ? (
        <FlatList
          data={plants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plantListContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No plants found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: 'rgb(214, 245, 214)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(5, 15, 6)',
    marginBottom: 15,
  },
  plantListContainer: {
    paddingVertical: 10,
  },
  plantCard: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
  },
  plantImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 15,
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
    color: 'black',
    marginBottom: 5,
  },
  plantSpecies: {
    fontSize: 14,
    color: 'rgba(5,15,6,0.5)',
    marginBottom: 5,
  },
  plantDate: {
    fontSize: 12,
    color: 'rgba(5,15,6,0.5)',
  },
  loadingText: {
    color: 'rgba(5,15,6,0.5)',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    color: 'rgba(5,15,6,0.5)',
    textAlign: 'center',
    fontSize: 16,
  },
});