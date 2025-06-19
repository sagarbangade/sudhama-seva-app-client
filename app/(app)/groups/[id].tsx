import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Button, Portal, Dialog, ActivityIndicator, Appbar, Checkbox } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { groupService } from '../../../services/groupService';
import { donorService } from '../../../services/donorService';
import { DonorCard } from '../../../components/DonorCard';
import { colors } from '../../../constants/theme';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [allDonors, setAllDonors] = useState<any[]>([]);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const loadGroup = async () => {
    try {
      const { group: groupData, donors: groupDonors } = await groupService.getGroupById(id);
      setGroup(groupData);
      setDonors(groupDonors);
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAllDonors = async () => {
    try {
      const { donors } = await donorService.getDonors({ limit: 100 });
      setAllDonors(donors);

      // Pre-select donors that are already in the group
      const groupDonorIds = new Set(donors.filter(d => d.group?._id === id).map(d => d._id));
      setSelectedDonors(groupDonorIds);
    } catch (error) {
      console.error('Error loading donors:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [id])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadGroup();
  };

  const handleShowAssignDialog = async () => {
    await loadAllDonors();
    setShowAssignDialog(true);
  };

  const handleAssignDonors = async () => {
    try {
      setAssigning(true);
      await groupService.assignDonorsToGroup(id, Array.from(selectedDonors));
      setShowAssignDialog(false);
      handleRefresh();
    } catch (error) {
      console.error('Error assigning donors:', error);
    } finally {
      setAssigning(false);
    }
  };

  const toggleDonorSelection = (donorId: string) => {
    const newSelected = new Set(selectedDonors);
    if (newSelected.has(donorId)) {
      newSelected.delete(donorId);
    } else {
      newSelected.add(donorId);
    }
    setSelectedDonors(newSelected);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Group not found</Text>
        <Button mode="contained" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={group.name} subtitle="Group Details" />
        <Appbar.Action icon="account-multiple-plus" onPress={handleShowAssignDialog} />
      </Appbar.Header>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleLarge">{group.name}</Text>
          {group.description && (
            <Text variant="bodyMedium" style={styles.description}>
              {group.description}
            </Text>
          )}
          <Text variant="bodySmall" style={styles.metadata}>
            Created by: {group.createdBy.name}
          </Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            Created: {new Date(group.createdAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={donors}
        renderItem={({ item }) => (
          <DonorCard
            donor={item}
            onPress={() => router.push(`/donors/${item._id}`)}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No donors in this group</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Add donors to this group by clicking the + button in the header
            </Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={showAssignDialog} onDismiss={() => setShowAssignDialog(false)}>
          <Dialog.Title>Assign Donors to Group</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <FlatList
              data={allDonors}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.checkboxRow}>
                  <Checkbox
                    status={selectedDonors.has(item._id) ? 'checked' : 'unchecked'}
                    onPress={() => toggleDonorSelection(item._id)}
                  />
                  <View style={styles.checkboxContent}>
                    <Text variant="bodyLarge">{item.name}</Text>
                    <Text variant="bodySmall" style={styles.hundiNo}>
                      Hundi: {item.hundiNo}
                    </Text>
                  </View>
                </View>
              )}
            />
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleAssignDonors}
              loading={assigning}
              disabled={assigning}
            >
              Assign
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  infoCard: {
    margin: 16,
    elevation: 2,
  },
  description: {
    marginTop: 8,
    color: colors.textSecondary,
  },
  metadata: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  timestamp: {
    color: colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 400,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxContent: {
    flex: 1,
    marginLeft: 8,
  },
  hundiNo: {
    color: colors.textSecondary,
  },
});