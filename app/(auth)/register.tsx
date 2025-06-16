import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { register, error, isLoading } = useAuth();

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await register(name, email, password);
      router.replace('/(app)');
    } catch (err) {
      // Error is handled by the auth context
      Alert.alert(
        'Registration Failed',
        error || 'An error occurred during registration. Please try again.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Register</Text>

        <TextInput
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setValidationErrors(prev => ({ ...prev, name: undefined }));
          }}
          mode="outlined"
          style={styles.input}
          error={!!validationErrors.name}
        />
        <HelperText type="error" visible={!!validationErrors.name}>
          {validationErrors.name}
        </HelperText>

        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setValidationErrors(prev => ({ ...prev, email: undefined }));
          }}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          error={!!validationErrors.email}
        />
        <HelperText type="error" visible={!!validationErrors.email}>
          {validationErrors.email}
        </HelperText>

        <TextInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setValidationErrors(prev => ({ ...prev, password: undefined }));
          }}
          mode="outlined"
          secureTextEntry={!isPasswordVisible}
          right={
            <TextInput.Icon
              icon={isPasswordVisible ? "eye-off" : "eye"}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          }
          style={styles.input}
          error={!!validationErrors.password}
        />
        <HelperText type="error" visible={!!validationErrors.password}>
          {validationErrors.password}
        </HelperText>

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
          }}
          mode="outlined"
          secureTextEntry={!isPasswordVisible}
          style={styles.input}
          error={!!validationErrors.confirmPassword}
        />
        <HelperText type="error" visible={!!validationErrors.confirmPassword}>
          {validationErrors.confirmPassword}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => router.push('/(auth)/login')}
          style={styles.linkButton}
        >
          Already have an account? Login
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surface: {
    padding: 20,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
  },
}); 