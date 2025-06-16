import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, Dimensions, KeyboardAvoidingView } from 'react-native';
import { Text, FAB, Searchbar, useTheme, ActivityIndicator, Snackbar, Button, Menu } from 'react-native-paper';
import { useFocusEffect, router } from 'expo-router';
import { DonorCard } from '../../components/DonorCard';
import { donorService } from '../../services/donorService';
import { useAuth } from '../../contexts/AuthContext';
import { Donor } from '../../services/donorService';
import { colors, styles as themeStyles } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

type SortOption = 'date-asc' | 'date-desc' | 'name-asc' | 'name-desc' | 'hundi-asc' | 'hundi-desc';

export default function HomeScreen() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { user } = useAuth();

  const navigateToProfile = () => router.push('/(app)/profile');
  const navigateToAddDonor = () => router.push('/(app)/add-donor');
  const navigateToDonorDetails = (id: string) => router.push(`/(app)/donors/${id}`);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.filterSection}>
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setShowSortMenu(true)}
              icon="sort"
              style={styles.sortButton}
            >
              Sort by
            </Button>
          }
        >
          <Menu.Item
            onPress={() => { setSortOption('date-asc'); setShowSortMenu(false); }}
            title="Collection Date (Earliest)"
            leadingIcon="calendar-arrow-up"
          />
          <Menu.Item
            onPress={() => { setSortOption('date-desc'); setShowSortMenu(false); }}
            title="Collection Date (Latest)"
            leadingIcon="calendar-arrow-down"
          />
          <Menu.Item
            onPress={() => { setSortOption('name-asc'); setShowSortMenu(false); }}
            title="Name (A-Z)"
            leadingIcon="sort-alphabetical-ascending"
          />
          <Menu.Item
            onPress={() => { setSortOption('name-desc'); setShowSortMenu(false); }}
            title="Name (Z-A)"
            leadingIcon="sort-alphabetical-descending"
          />
          <Menu.Item
            onPress={() => { setSortOption('hundi-asc'); setShowSortMenu(false); }}
            title="Hundi No. (Ascending)"
            leadingIcon="numeric-1-box-multiple-outline"
          />
          <Menu.Item
            onPress={() => { setSortOption('hundi-desc'); setShowSortMenu(false); }}
            title="Hundi No. (Descending)"
            leadingIcon="numeric-9-box-multiple-outline"
          />
        </Menu>
      </View>

      {donors.length > 0 && (
        <Text style={styles.resultCount}>
          {donors.length} donor{donors.length !== 1 ? 's' : ''}
        </Text>
      )}
    </View>
  );

  const loadDonors = async (filters: { page?: number; search?: string; sort?: SortOption } = {}) => {
    try {
      setError(null);
      const { donors: newDonors, pagination } = await donorService.getDonors({
        page: filters.page || page,
        limit: 20,
        search: filters.search || searchQuery,
      });

      // Sort donors based on current sort option
      const sortedDonors = [...newDonors].sort((a, b) => {
        switch (sortOption) {
          case 'date-asc':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'date-desc':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'hundi-asc':
            return a.hundiNo.localeCompare(b.hundiNo);
          case 'hundi-desc':
            return b.hundiNo.localeCompare(a.hundiNo);
          default:
            return 0;
        }
      });

      setDonors(sortedDonors);
      setTotalPages(pagination.pages);
    } catch (err) {
      console.error('Error loading donors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load donors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    loadDonors({ page: 1, search: query });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadDonors({ page: 1 });
  };

  // Load initial data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadDonors();
    }, [sortOption])
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <Searchbar
          placeholder="Search donors..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
        <MaterialCommunityIcons
          name="account-circle"
          size={32}
          color={colors.primary}
          onPress={navigateToProfile}
          style={styles.profileButton}
        />
      </View>

      <FlatList
        data={donors}
        renderItem={({ item }) => (
          <DonorCard
            donor={item}
            onPress={() => navigateToDonorDetails(item._id)}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={styles.emptyText}>
              {error ? 'Error loading donors' : 'No donors found'}
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {error ? error : searchQuery
                ? 'Try a different search term'
                : 'Add your first donor by clicking the + button'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToAddDonor}
        color={colors.white}
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Retry',
          onPress: handleRefresh,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    padding: 16,
    paddingBottom: 8,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortButton: {
    borderColor: colors.primary,
    borderRadius: 20,
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
    backgroundColor: colors.white,
    borderRadius: 24,
    elevation: 2,
    height: 48,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchInput: {
    fontSize: 16,
    height: 48,
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  resultCount: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 300,
  },
  emptyText: {
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textLight,
    textAlign: 'center',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: colors.primary,
    borderRadius: 30,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  snackbar: {
    backgroundColor: colors.error,
    marginBottom: Platform.OS === 'ios' ? 40 : 16,
  },
});