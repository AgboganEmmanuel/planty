import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Alert 
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const SettingsScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Settings'>) => {
  const { session, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        //console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    };

    fetchUserProfile();
  }, [session]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const renderProfileSection = () => (
    <View style={styles.profileContainer}>
      <Image
        source={{ 
          uri: userProfile?.avatar_url || 
               'https://ui-avatars.com/api/?name=' + 
               (userProfile?.full_name || session?.user?.email || 'User')
        }}
        style={styles.profileImage}
      />
      <Text style={styles.profileName}>
        {userProfile && userProfile.full_name ? userProfile.full_name : (session?.user?.email || 'User')}
      </Text>
      <Text style={styles.profileEmail}>
        {session?.user?.email}
      </Text>
    </View>
  );

  const renderSettingsOptions = () => (
    <View style={styles.settingsContainer}>
      <TouchableOpacity 
        style={styles.settingItem}
        //onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="person-outline" size={24} color="#4A4A4A" />
        <Text style={styles.settingText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={24} color="#4A4A4A" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.settingItem}
        //onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color="#4A4A4A" />
        <Text style={styles.settingText}>Notifications</Text>
        <Ionicons name="chevron-forward" size={24} color="#4A4A4A" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.settingItem}
        //onPress={() => navigation.navigate('Privacy')}
      >
        <Ionicons name="lock-closed-outline" size={24} color="#4A4A4A" />
        <Text style={styles.settingText}>Privacy & Security</Text>
        <Ionicons name="chevron-forward" size={24} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  );

  const renderLogoutButton = () => (
    <TouchableOpacity 
      style={styles.logoutButton} 
      onPress={handleLogout}
    >
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Settings</Text>
        {renderProfileSection()}
        {renderSettingsOptions()}
        {renderLogoutButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    color: '#2C3E50',
  },
  profileContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  profileEmail: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;