import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

export default function TabBar() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    { 
        title: 'Home', 
        icon: 'home-outline',
        route: '/'
      },
    { 
      title: 'Identifier une Plante', 
      icon: 'camera-outline',
      route: '/screens/identify-plant'
    },
    { 
      title: 'Mes Plantes', 
      icon: 'leaf-outline',
      route: '/screens/my-plants'
    },
    { 
      title: 'Notifications', 
      icon: 'notifications-outline',
      route: '/screens/notifications'
    },
    { 
      title: 'Settings', 
      icon: 'settings-outline', 
      route: '/screens/settings'
    }
  ];

  return (
    <View style={{ 
      flexDirection: 'row', 
      justifyContent: 'space-around', 
      paddingVertical: 24, 
      backgroundColor: '#1F8549' 
    }}>
      {menuItems.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => router.push(item.route as any)}
          style={{ alignItems: 'center' }}
        >
          <Ionicons name={item.icon as any} size={24} color="white" />
        </TouchableOpacity>
      ))}
    </View>
  );
}