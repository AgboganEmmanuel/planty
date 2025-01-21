import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Type definition for Notification
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  plant_id?: string;
  message: string;
  is_read: boolean;
  created_at: string;
  plant_name?: string; 
}

// Notification creation parameters type
export interface CreateNotificationParams {
  type: string;
  message: string;
  plant_id?: string;
}

// Function to create a notification (can be imported and used in other files)
export async function createNotification(params: CreateNotificationParams) {
  const { type, message, plant_id } = params;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    Alert.alert('Error', 'User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type,
      message,
      plant_id: plant_id || null,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    Alert.alert('Error', 'Could not create notification');
    return null;
  }

  return data;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  const fetchPlantName = async (plantId?: string): Promise<string | undefined> => {
    if (!plantId) return undefined;

    const { data, error } = await supabase
      .from('plants')
      .select('plant_name')
      .eq('id', plantId)
      .single();

    if (error) {
      console.error('Error fetching plant name:', error);
      return undefined;
    }

    return data?.plant_name;
  };

  const fetchNotifications = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    const processedNotifications = await Promise.all(
      (data || []).map(async (notification) => ({
        ...notification,
        plant_name: await fetchPlantName(notification.plant_id)
      }))
    );

    setNotifications(processedNotifications);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, is_read: true } 
        : notification
    ));
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      onPress={() => markNotificationAsRead(item.id)}
      style={[
        styles.notificationCard, 
        { backgroundColor: item.is_read ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }
      ]}
    >
      <View style={styles.notificationContent}>
        <Text style={[
          styles.notificationMessage, 
          { fontWeight: item.is_read ? 'normal' : 'bold' }
        ]}>
          {item.message}
        </Text>
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationType}>{item.type}</Text>
          {item.plant_name && (
            <Text style={styles.plantName}>• {item.plant_name}</Text>
          )}
        </View>
      </View>
      {!item.is_read && (
        <Ionicons 
          name="notifications-outline" 
          size={24} 
          color="white" 
        />
      )}
    </TouchableOpacity>
  );

  // Separate unread and read notifications
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {unreadNotifications.length > 0 && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>New Notifications:</Text>
          </View>
          
          <FlatList
            data={unreadNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {readNotifications.length > 0 && (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Old Notifications:</Text>
          </View>
          
          <FlatList
            data={readNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}

      {notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
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
  listContainer: {
    paddingHorizontal: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationMessage: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  notificationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  notificationType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  plantName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
  },
});