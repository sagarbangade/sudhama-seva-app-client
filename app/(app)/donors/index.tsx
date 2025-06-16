import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Searchbar, FAB, Portal, Dialog, Button, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { donorService, Donor, DonorFilters } from '../../../services/donorService';
import { DonorForm } from '../../../components/DonorForm';

export default function DonorsScreen() {
  const router = useRouter();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  const loadDonors = async (filters: DonorFilters = {}) => {
    try {
      const { donors: newDonors, pagination: newPagination } = await donorService.getDonors({
        ...filters,
        search: searchQuery,
      });
      setDonors(newDonors);
      setPagination(newPagination);
    } catch (error) {
      console.error('Error loading donors:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDonors();
    }, [searchQuery])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDonors({ page: 1 });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddDonor = async (data: Omit<Donor, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    try {
      setSubmitting(true);
      await donorService.createDonor(data);
      setShowAddDialog(false);
      handleRefresh();
    } catch (error) {
      console.error('Error adding donor:', error);
      // TODO: Show error message to user
    } finally {
      setSubmitting(false);
    }
  };

  const renderDonorCard = ({ item }: { item: Donor }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/donors/${item._id}`)}
    >
      <Card.Content>
        <Text variant="titleMedium">{item.name}</Text>
        <Text variant="bodyMedium">Hundi No: {item.hundiNo}</Text>
        <Text variant="bodyMedium">Mobile: {item.mobileNumber}</Text>
        <Text variant="bodyMedium" numberOfLines={2}>
          Address: {item.address}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          Date: {new Date(item.date).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search donors..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={donors}
        renderItem={renderDonorCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No donors found</Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Add New Donor</Dialog.Title>
          <Dialog.Content>
            <DonorForm onSubmit={handleAddDonor} isLoading={submitting} />
          </Dialog.Content>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddDialog(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  date: {
    marginTop: 8,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 