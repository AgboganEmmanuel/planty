// app/screens/auth/SignInScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn(email, password);
      // Navigation handled by auth listener in context
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Sign In Error', error.message);
      } else {
        Alert.alert('Sign In Error', 'An unknown error occurred');
      }
    }
  };

  return (
    <LinearGradient 
      colors={['#2ecc71', '#27ae60']} 
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSignIn}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/screens/auth/SignUpScreen')}
        >
          <Text style={styles.switchText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '80%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  switchText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 15,
  }
});