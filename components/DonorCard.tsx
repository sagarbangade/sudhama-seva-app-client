import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, List } from 'react-native-paper';
import { colors } from '../constants/theme';
import { Donor } from '../services/donorService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface DonorCardProps {
  donor: Donor;
  onPress: () => void;
}

export function DonorCard({ donor, onPress }: DonorCardProps) {
  const [expanded, setExpanded] = useState(false);

  console.log('DonorCard rendering with donor:', { id: donor._id, name: donor.name });

  const daysUntilCollection = () => {
    const collectionDate = new Date(donor.date);
    const today = new Date();
    const diffTime = collectionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    const days = daysUntilCollection();
    if (days < 0) return colors.error;
    if (days === 0) return colors.warning;
    return colors.success;
  };

  const handleMapPress = () => {
    if (donor.googleMapLink) {
      Linking.openURL(donor.googleMapLink);
    }
  };

  return (
    <Card
      style={[
        styles.card,
        {
          borderLeftColor: getStatusColor(),
          borderLeftWidth: 4,
        }
      ]}
      mode="elevated"
    >
      <List.Accordion
        expanded={expanded}
        onPress={() => setExpanded(!expanded)}
        style={styles.accordion}
        title=""
        left={props => (
          <View style={styles.mainInfo}>
            <Text variant="titleMedium" style={styles.name}>{donor.name}</Text>
            <Text variant="bodyMedium" style={styles.hundiNo}>Hundi: {donor.hundiNo}</Text>
          </View>
        )}
        right={props => (
          <View style={styles.statusContainer}>
            <Text variant="bodySmall" style={[styles.status, { color: getStatusColor() }]}>
              {daysUntilCollection() === 0 ? 'Today' :
                daysUntilCollection() < 0 ? `${Math.abs(daysUntilCollection())}d overdue` :
                  `${daysUntilCollection()}d remaining`}
            </Text>
          </View>
        )}
      >
        <Card.Content style={styles.content}>
          <Pressable onPress={() => Linking.openURL(`tel:${donor.mobileNumber}`)} style={styles.infoRow}>
            <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.infoText}>{donor.mobileNumber}</Text>
          </Pressable>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="home" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.infoText} numberOfLines={2}>
              {donor.address}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
            <Text variant="bodyMedium" style={styles.infoText}>
              Collection Date: {new Date(donor.date).toLocaleDateString()}
            </Text>
          </View>

          {donor.googleMapLink && (
            <Pressable onPress={handleMapPress} style={styles.mapButton}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
              <Text variant="bodyMedium" style={[styles.infoText, styles.mapText]}>
                Open in Maps
              </Text>
            </Pressable>
          )}

          <Pressable onPress={onPress} style={styles.detailsButton}>
            <Text variant="bodyMedium" style={styles.detailsText}>View Full Details</Text>
          </Pressable>
        </Card.Content>
      </List.Accordion>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  accordion: {
    backgroundColor: colors.surface,
    padding: 0,
    paddingRight: 8, // Add right padding for status container
  },
  mainInfo: {
    flex: 1,
    paddingLeft: 16, // Increase left padding
    paddingVertical: 12,
    marginRight: 8, // Add right margin to prevent overlap with status
  },
  name: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    flexWrap: 'wrap', // Allow text to wrap
  },
  hundiNo: {
    color: colors.textSecondary,
    fontSize: 14,
    flexWrap: 'wrap', // Allow text to wrap
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginLeft: 'auto', // Push to the right
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 80, // Ensure minimum width for status
  },
  content: {
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
    marginTop: 4,
  },
  mapText: {
    color: colors.primary,
    fontWeight: '500',
  },
  detailsButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailsText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  status: {
    fontWeight: '600',
    fontSize: 12,
  },
});