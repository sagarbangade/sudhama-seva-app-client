import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, Portal, Dialog, TextInput, Button, IconButton, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { groupService, Group } from '../../../services/groupService';
import { colors } from '../../../constants/theme';

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadGroups = async () => {
    try {
      const groups = await groupService.getGroups();
      setGroups(groups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingGroup) {
        await groupService.updateGroup(editingGroup._id, { name, description });
      } else {
        await groupService.createGroup({ name, description });
      }
      setShowAddDialog(false);
      setEditingGroup(null);
      setName('');
      setDescription('');
      handleRefresh();
    } catch (error) {
      console.error('Error saving group:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setName(group.name);
    setDescription(group.description || '');
    setShowAddDialog(true);
  };

  const handleDelete = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId);
      handleRefresh();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const renderGroupCard = ({ item }: { item: Group }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={item.name}
        subtitle={item.description}
        right={(props) => (
          <View style={styles.cardActions}>
            <IconButton
              icon="pencil"
              onPress={() => handleEdit(item)}
              {...props}
            />
            <IconButton
              icon="delete"
              onPress={() => handleDelete(item._id)}
              {...props}
            />
          </View>
        )}
      />
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No groups found</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Add your first group by clicking the + button
            </Text>
          </View>
        }
      />

      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => {
          setShowAddDialog(false);
          setEditingGroup(null);
          setName('');
          setDescription('');
        }}>
          <Dialog.Title>{editingGroup ? 'Edit Group' : 'Add New Group'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Description (optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              style={styles.input}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddDialog(false);
              setEditingGroup(null);
              setName('');
              setDescription('');
            }}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting || !name.trim()}
            >
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </Dialog.Actions>
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
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});