import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { colors } from '../constants/theme';
import { Donation } from '../services/donationService';

interface DonationCardProps {
  donation: Donation;
  onStatusChange?: (id: string, status: 'pending' | 'collected' | 'skipped') => void;
}

export function DonationCard({ donation, onStatusChange }: DonationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collected':
        return colors.success;
      case 'skipped':
        return colors.warning;
      default:
        return colors.error;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View>
            <Text variant="titleMedium">{donation.donor.name}</Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Hundi No: {donation.donor.hundiNo}
            </Text>
          </View>
          <Chip
            mode="flat"
            textStyle={{ color: colors.white }}
            style={[styles.statusChip, { backgroundColor: getStatusColor(donation.status) }]}
          >
            {donation.status.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.details}>
          <Text variant="bodyMedium">Amount: ₹{donation.amount}</Text>
          <Text variant="bodyMedium">
            Collection Date: {new Date(donation.collectionDate).toLocaleDateString()}
          </Text>
          {donation.notes && (
            <Text variant="bodyMedium" style={styles.notes}>
              Notes: {donation.notes}
            </Text>
          )}
        </View>

        {onStatusChange && donation.status !== 'collected' && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => onStatusChange(donation._id, 'collected')}
              style={styles.actionButton}
            >
              Mark Collected
            </Button>
            {donation.status !== 'skipped' && (
              <Button
                mode="outlined"
                onPress={() => onStatusChange(donation._id, 'skipped')}
                style={[styles.actionButton, styles.skipButton]}
              >
                Skip
              </Button>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusChip: {
    borderRadius: 12,
  },
  details: {
    gap: 4,
  },
  notes: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  skipButton: {
    borderColor: colors.warning,
  },
});