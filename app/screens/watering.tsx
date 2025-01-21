// app/screens/watering.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { createNotification } from './notifications'; // Import the notification creation function

interface WateringPlant {
  id: string;
  plant_name: string;
  image_url?: string;
  last_watered?: string;
  next_watering_date?: string;
  watering_frequency: number;
}

export default function WateringScreen() {
  const { session } = useAuth();
  const [plants, setPlants] = useState<WateringPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<WateringPlant | null>(null);

  useEffect(() => {
    fetchWateringPlants();
    checkWateringNotifications();
  }, [session]);

  const fetchWateringPlants = async () => {
    if (!session?.user) return [];

    const { data, error } = await supabase
      .from('plants')
      .select('id, plant_name, image_url, last_watered, next_watering_date, watering_frequency')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error fetching watering plants:', error);
      return [];
    }

    setPlants(data || []);
    return data || [];
  };

  const checkWateringNotifications = async () => {
    if (!session?.user) return;

    const now = new Date();
    const plants = await fetchWateringPlants();

    // Use Promise.all to handle multiple async notifications
    await Promise.all(plants.map(async (plant) => {
      if (plant.next_watering_date) {
        const nextWatering = new Date(plant.next_watering_date);
        const isOverdue = nextWatering < now;
        const isToday = nextWatering.toDateString() === now.toDateString();

        if (isOverdue) {
          await createNotification({
            type: 'Watering Overdue',
            message: `${plant.plant_name} needs watering urgently!`,
            plant_id: plant.id
          });
        }

        if (isToday) {
          await createNotification({
            type: 'Watering Today',
            message: `${plant.plant_name} needs watering today!`,
            plant_id: plant.id
          });
        }
      }
    }));
  };

  const recordWatering = async (plant: WateringPlant) => {
    const now = new Date();
    const nextWateringDate = new Date(now);
    nextWateringDate.setDate(now.getDate() + plant.watering_frequency);

    const { error } = await supabase
      .from('plants')
      .update({
        last_watered: now.toISOString(),
        next_watering_date: nextWateringDate.toISOString()
      })
      .eq('id', plant.id);

    if (error) {
      Alert.alert('Error', 'Could not record watering');
      return;
    }

    // Create a notification for watering
    await createNotification({
      type: 'Watering Completed',
      message: `You watered ${plant.plant_name}`,
      plant_id: plant.id
    });

    // Schedule a notification for next watering
    await scheduleWateringNotification(plant, nextWateringDate);

    // Refresh the list
    fetchWateringPlants();
  };

  const scheduleWateringNotification = async (plant: WateringPlant, nextWateringDate: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Water Your Plant!",
        body: `Don't forget to water your ${plant.plant_name}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextWateringDate,
      },
    });
  };

  const renderPlantWateringItem = ({ item }: { item: WateringPlant }) => {
    const nextWatering = item.next_watering_date 
      ? new Date(item.next_watering_date) 
      : null;
    const isOverdue = nextWatering && nextWatering < new Date();

    return (
      <View style={[
        styles.plantCard, 
        isOverdue && styles.overdueCard
      ]}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.plantImage} 
          />
        ) : (
          <View style={styles.placeholderImage} />
        )}
        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>{item.plant_name}</Text>
          <Text style={styles.wateringInfo}>
            Watering Frequency: Every {item.watering_frequency} days
          </Text>
          {nextWatering && (
            <Text style={[
              styles.nextWateringText,
              isOverdue && styles.overdueText
            ]}>
              Next Watering: {nextWatering.toLocaleDateString()}
              {isOverdue && " (OVERDUE)"}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.waterButton}
            onPress={() => recordWatering(item)}
          >
            <Text style={styles.waterButtonText}>Water Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Plant Watering</Text>
      </View>
      <FlatList 
        data={plants}
        renderItem={renderPlantWateringItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  listContainer: {
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
  overdueCard: {
    borderColor: 'red',
    borderWidth: 2,
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
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  wateringInfo: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  nextWateringText: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 10,
  },
  overdueText: {
    color: 'red',
    fontWeight: 'bold',
  },
  waterButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  waterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});