import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Card from '../components/card';

export default function HomeScreen() {
  // Get current date and format it
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.date}>{currentDate}</Text>
          <LottieView
            source={require('../assets/json/plant.json')}
            autoPlay
            loop
            style={{ 
              width: 300, 
              height: 250, 
              alignSelf: 'center',
            }}
          />
        </View>
      </SafeAreaView>
      <Card />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    marginLeft: 10,
    marginTop: 10
  },
  subtitle: {
    fontSize: 16,
    color: 'limegreen',
    opacity: 0.8,
  },
});