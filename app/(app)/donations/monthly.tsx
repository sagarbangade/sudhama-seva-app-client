import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Appbar, Card, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { donationService, MonthlyStatus } from '../../../services/donationService';
import { DonationCard } from '../../../components/DonationCard';
import { DonationMonthPicker } from '../../../components/DonationMonthPicker';
import { colors } from '../../../constants/theme';

export default function MonthlyDonationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyStatus, setMonthlyStatus] = useState<MonthlyStatus | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadMonthlyStatus = async () => {
    try {
      setLoading(true);
      const status = await donationService.getMonthlyStatus(selectedYear, selectedMonth);
      setMonthlyStatus(status);
    } catch (error) {
      console.error('Error loading monthly status:', error);
      Alert.alert('Error', 'Failed to load monthly donation status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMonthlyStatus();
  }, [selectedYear, selectedMonth]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMonthlyStatus();
  };

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleStatusChange = async (donationId: string, newStatus: 'collected' | 'skipped') => {
    try {
      await donationService.updateDonation(donationId, { status: newStatus });
      loadMonthlyStatus();
    } catch (error) {
      console.error('Error updating donation status:', error);
      Alert.alert('Error', 'Failed to update donation status');
    }
  };

  const handleInitializeMonth = async () => {
    try {
      await donationService.initializeMonthlyDonations();
      loadMonthlyStatus();
      Alert.alert('Success', 'Monthly donations initialized successfully');
    } catch (error) {
      console.error('Error initializing monthly donations:', error);
      Alert.alert('Error', 'Failed to initialize monthly donations');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Monthly Donations" />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Monthly Donations" />
        <Appbar.Action icon="refresh" onPress={handleInitializeMonth} />
      </Appbar.Header>

      <DonationMonthPicker
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelect={handleMonthSelect}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {monthlyStatus && (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text variant="titleLarge" style={styles.statValue}>
                      {monthlyStatus.stats.total}
                    </Text>
                    <Text variant="bodySmall">Total Donors</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="titleLarge" style={[styles.statValue, { color: colors.success }]}>
                      {monthlyStatus.stats.collected}
                    </Text>
                    <Text variant="bodySmall">Collected</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="titleLarge" style={[styles.statValue, { color: colors.error }]}>
                      {monthlyStatus.stats.pending}
                    </Text>
                    <Text variant="bodySmall">Pending</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="titleLarge" style={[styles.statValue, { color: colors.warning }]}>
                      {monthlyStatus.stats.skipped}
                    </Text>
                    <Text variant="bodySmall">Skipped</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <Text variant="bodyMedium" style={styles.progressLabel}>
                    Collection Progress
                  </Text>
                  <ProgressBar
                    progress={monthlyStatus.stats.collected / monthlyStatus.stats.total}
                    color={colors.success}
                    style={styles.progressBar}
                  />
                </View>

                <Text variant="titleMedium" style={styles.totalAmount}>
                  Total Amount: ₹{monthlyStatus.stats.totalAmount.toLocaleString()}
                </Text>
              </Card.Content>
            </Card>

            <View style={styles.listContainer}>
              {monthlyStatus.statusReport.map((item) => (
                <DonationCard
                  key={item.donor.id}
                  donation={item.donation || {
                    _id: `pending-${item.donor.id}`,
                    donor: {
                      _id: item.donor.id,
                      name: item.donor.name,
                      hundiNo: item.donor.hundiNo
                    },
                    amount: 0,
                    collectionDate: new Date().toISOString(),
                    collectionMonth: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
                    status: 'pending',
                    collectedBy: { _id: '', name: '', email: '' },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '25%',
  },
  statValue: {
    fontWeight: 'bold',
  },
  progressSection: {
    marginVertical: 16,
  },
  progressLabel: {
    marginBottom: 8,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  totalAmount: {
    textAlign: 'right',
    color: colors.primary,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});
