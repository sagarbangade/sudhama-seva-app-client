import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { colors } from '../constants/theme';
import { Donation } from '../services/donationService';

interface DonationCardProps {
  donation: Donation;
  onStatusChange?: (id: string, status: 'collected' | 'skipped', data?: { amount?: number; notes?: string }) => void;
}

export function DonationCard({ donation, onStatusChange }: DonationCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState(donation.amount.toString());
  const [notes, setNotes] = useState(donation.notes || '');

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

  const handleCollect = () => {
    if (donation.status !== 'collected') {
      setModalVisible(true);
    }
  };

  const handleConfirmCollection = () => {
    if (onStatusChange) {
      onStatusChange(donation._id, 'collected', {
        amount: parseFloat(amount),
        notes: notes.trim() || undefined
      });
    }
    setModalVisible(false);
  };

  const handleSkip = () => {
    if (onStatusChange) {
      onStatusChange(donation._id, 'skipped', { notes: 'Skipped for this month' });
    }
  };

  return (
    <>
      <Card style={[styles.card, { borderLeftColor: getStatusColor(donation.status), borderLeftWidth: 4 }]}>
        <Card.Content>
          <View style={styles.header}>
            <View>
              <Text variant="titleMedium">{donation.donor.name}</Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                Hundi No: {donation.donor.hundiNo}
              </Text>
            </View>
            <Text
              variant="labelLarge"
              style={[styles.status, { color: getStatusColor(donation.status) }]}
            >
              {donation.status.toUpperCase()}
            </Text>
          </View>

          {donation.status === 'collected' && (
            <View style={styles.collectedInfo}>
              <Text variant="bodyMedium">Amount: ₹{donation.amount.toLocaleString()}</Text>
              {donation.notes && (
                <Text variant="bodySmall" style={styles.notes}>
                  Notes: {donation.notes}
                </Text>
              )}
              <Text variant="bodySmall" style={styles.collectedBy}>
                Collected by: {donation.collectedBy.name}
              </Text>
            </View>
          )}

          {donation.status !== 'collected' && onStatusChange && (
            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleCollect}
                icon="cash"
                style={[styles.actionButton, { backgroundColor: colors.success }]}
              >
                Collect
              </Button>
              {donation.status !== 'skipped' && (
                <Button
                  mode="outlined"
                  onPress={handleSkip}
                  icon="close-circle"
                  style={styles.actionButton}
                  textColor={colors.warning}
                >
                  Skip
                </Button>
              )}
            </View>
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Collection Details
          </Text>
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            multiline
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmCollection}
              style={styles.modalButton}
              disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
            >
              Confirm
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 2,
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
  status: {
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  collectedInfo: {
    marginTop: 8,
    gap: 4,
  },
  notes: {
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  collectedBy: {
    color: colors.textSecondary,
    marginTop: 4,
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
  modal: {
    backgroundColor: colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: colors.text,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalButton: {
    minWidth: 100,
  },
});