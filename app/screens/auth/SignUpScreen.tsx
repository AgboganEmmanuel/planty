// app/screens/auth/SignUpScreen.tsx
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

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signUp(email, password);
      // Navigation handled by auth listener in context
      Alert.alert('Success', 'Account created successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Sign Up Error', error.message);
      } else {
        Alert.alert('Sign Up Error', 'An unknown error occurred');
      }
    }
  };

  return (
    <LinearGradient 
      colors={['#E8F5E9', '#A5D6A7']} 
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
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
        <TextInput 
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push('/screens/auth/SignInScreen')}
        >
          <Text style={styles.switchText}>
            Already have an account? Sign In
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E7D32',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    marginTop: 15,
    color: '#2E7D32',
    textDecorationLine: 'underline',
  },
});