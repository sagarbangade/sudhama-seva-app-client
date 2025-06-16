import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Appbar, Card, ProgressBar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { donationService } from '../../../services/donationService';
import { DonationCard } from '../../../components/DonationCard';
import { colors } from '../../../constants/theme';

export default function MonthlyDonationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyStatus, setMonthlyStatus] = useState<any>(null);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());

  const loadMonthlyStatus = async () => {
    try {
      const status = await donationService.getMonthlyStatus(currentYear, currentMonth);
      setMonthlyStatus(status);
    } catch (error) {
      console.error('Error loading monthly status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMonthlyStatus();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMonthlyStatus();
  };

  const handleStatusChange = async (donationId: string, newStatus: 'collected' | 'skipped' | 'pending') => {
    try {
      await donationService.updateDonation(donationId, { status: newStatus });
      loadMonthlyStatus();
    } catch (error) {
      console.error('Error updating donation status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Monthly Donations" />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Monthly Donations" />
      </Appbar.Header>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              {new Date(currentYear, currentMonth - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text variant="headlineMedium">{monthlyStatus?.collected || 0}</Text>
                <Text variant="bodyMedium">Collected</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineMedium">{monthlyStatus?.pending || 0}</Text>
                <Text variant="bodyMedium">Pending</Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineMedium">{monthlyStatus?.skipped || 0}</Text>
                <Text variant="bodyMedium">Skipped</Text>
              </View>
            </View>

            <ProgressBar
              progress={
                monthlyStatus?.totalDonors
                  ? monthlyStatus.collected / monthlyStatus.totalDonors
                  : 0
              }
              color={colors.success}
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        <View style={styles.listContainer}>
          {monthlyStatus?.statusReport.map((item: any) => (
            <DonationCard
              key={item.donor.id}
              donation={item.donation || {
                _id: `pending-${item.donor.id}`,
                donor: item.donor,
                amount: 0,
                collectionDate: new Date().toISOString(),
                status: 'pending',
                collectionMonth: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </View>
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
    backgroundColor: colors.surface,
  },
  summaryTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});
