import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Text, Card, Button, Avatar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors, styles as themeStyles } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Avatar.Text
          size={80}
          label={user.name.charAt(0).toUpperCase()}
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />
        <Text variant="headlineMedium" style={styles.name}>{user.name}</Text>
        <Text variant="titleMedium" style={styles.role}>{user.role.toUpperCase()}</Text>
      </View>

      <View style={styles.content}>
        <Card style={[styles.card, { backgroundColor: colors.card }]}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="titleMedium" style={styles.label}>Email</Text>
              <Text variant="bodyLarge" style={styles.value}>{user.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="titleMedium" style={styles.label}>Role</Text>
              <Text variant="bodyLarge" style={styles.value}>{user.role}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="titleMedium" style={styles.label}>Member Since</Text>
              <Text variant="bodyLarge" style={styles.value}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  header: {
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
    ...themeStyles.shadow,
  } as ViewStyle,
  avatar: {
    backgroundColor: colors.background,
    marginBottom: 16,
  } as ViewStyle,
  avatarLabel: {
    color: colors.primary,
    fontSize: 32,
  } as TextStyle,
  name: {
    color: colors.background,
    fontWeight: 'bold',
    marginBottom: 8,
  } as TextStyle,
  role: {
    color: colors.background,
    opacity: 0.9,
  } as TextStyle,
  content: {
    padding: 16,
  } as ViewStyle,
  card: {
    ...themeStyles.card,
    marginBottom: 24,
  } as ViewStyle,
  infoRow: {
    marginBottom: 16,
  } as ViewStyle,
  label: {
    color: colors.textSecondary,
    marginBottom: 4,
  } as TextStyle,
  value: {
    color: colors.text,
  } as TextStyle,
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
  } as ViewStyle,
  logoutButtonContent: {
    paddingVertical: 8,
  } as ViewStyle,
}); 