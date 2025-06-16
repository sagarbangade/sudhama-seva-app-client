import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Appbar } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { donorService, Donor } from '../../../services/donorService';
import { colors } from '../../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DonorDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('DonorDetailsScreen mounted with id:', id);

  const loadDonor = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching donor data for id:', id);
      const donorData = await donorService.getDonorById(id);
      console.log('Donor data received:', donorData);
      setDonor(donorData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load donor details';
      console.error('Error loading donor:', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log('Loading donor with id:', id);
    loadDonor();
  }, [id, loadDonor]);

  const handleOpenMap = async () => {
    if (donor?.googleMapLink) {
      try {
        await Linking.openURL(donor.googleMapLink);
      } catch (error) {
        console.error('Error opening map:', error);
        Alert.alert('Error', 'Could not open map link');
      }
    }
  };

  const handleCall = async () => {
    if (donor?.mobileNumber) {
      try {
        await Linking.openURL(`tel:${donor.mobileNumber}`);
      } catch (error) {
        console.error('Error making call:', error);
        Alert.alert('Error', 'Could not make call');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  if (!donor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Donor not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Donor Details" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.name}>{donor.name}</Text>
            <Text variant="titleMedium" style={styles.hundiNo}>Hundi No: {donor.hundiNo}</Text>

            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleCall}
                icon="phone"
                style={[styles.actionButton, { marginRight: 8 }]}
              >
                Call
              </Button>
              <Button
                mode="contained"
                onPress={handleOpenMap}
                icon="map-marker"
                style={styles.actionButton}
              >
                Open Map
              </Button>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Contact Details</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
                <Text variant="bodyLarge" style={styles.infoText}>{donor.mobileNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="home" size={20} color={colors.primary} />
                <Text variant="bodyLarge" style={styles.infoText}>{donor.address}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Collection Information</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
                <Text variant="bodyLarge" style={styles.infoText}>
                  {new Date(donor.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Additional Details</Text>
              <Text variant="bodyMedium" style={styles.metadata}>
                Created by: {donor.createdBy.name}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                Created: {new Date(donor.createdAt).toLocaleDateString()}
              </Text>
              <Text variant="bodySmall" style={styles.timestamp}>
                Last updated: {new Date(donor.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  name: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  hundiNo: {
    color: colors.textSecondary,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
  },
  metadata: {
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timestamp: {
    color: colors.textLight,
    marginTop: 4,
  },
  errorText: {
    color: colors.error,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
});