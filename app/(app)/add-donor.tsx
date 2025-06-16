import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Appbar, Snackbar, Portal, Dialog, Button } from 'react-native-paper';
import { router, useRouter } from 'expo-router';
import { DonorForm } from '../../components/DonorForm';
import { donorService } from '../../services/donorService';
import { colors } from '../../constants/theme';

export default function AddDonorScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDonorData, setPendingDonorData] = useState<any>(null);

  const navigateBack = () => {
    router.push('/');
  };

  const handleSubmit = async (data: any) => {
    try {
      setPendingDonorData(data);
      setShowConfirmDialog(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add donor';
      console.error('Error adding donor:', err);
      setError(errorMessage);
    }
  };

  const confirmAddDonor = async () => {
    if (!pendingDonorData) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await donorService.createDonor(pendingDonorData);
      navigateBack();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add donor';
      console.error('Error adding donor:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={navigateBack} />
        <Appbar.Content title="Add New Donor" />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <DonorForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </ScrollView>

      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm Add Donor</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to add this donor?</Text>
            {pendingDonorData && (
              <View style={styles.confirmationDetails}>
                <Text>Name: {pendingDonorData.name}</Text>
                <Text>Hundi No: {pendingDonorData.hundiNo}</Text>
                <Text>Mobile: {pendingDonorData.mobileNumber}</Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={confirmAddDonor}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Dismiss',
          onPress: () => setError(null),
        }}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 90,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
  confirmationDetails: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
}); 