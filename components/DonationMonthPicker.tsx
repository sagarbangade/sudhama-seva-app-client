import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';
import { colors } from '../constants/theme';

interface DonationMonthPickerProps {
  selectedYear: number;
  selectedMonth: number;
  onSelect: (year: number, month: number) => void;
}

export function DonationMonthPicker({ selectedYear, selectedMonth, onSelect }: DonationMonthPickerProps) {
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View style={styles.container}>
      <Menu
        visible={showYearMenu}
        onDismiss={() => setShowYearMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowYearMenu(true)}
            icon="calendar"
            style={styles.yearButton}
          >
            {selectedYear}
          </Button>
        }
      >
        {years.map(year => (
          <Menu.Item
            key={year}
            onPress={() => {
              onSelect(year, selectedMonth);
              setShowYearMenu(false);
            }}
            title={year.toString()}
          />
        ))}
      </Menu>

      <Menu
        visible={showMonthMenu}
        onDismiss={() => setShowMonthMenu(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setShowMonthMenu(true)}
            icon="calendar-month"
            style={styles.monthButton}
          >
            {months[selectedMonth - 1]}
          </Button>
        }
      >
        {months.map((month, index) => (
          <Menu.Item
            key={month}
            onPress={() => {
              onSelect(selectedYear, index + 1);
              setShowMonthMenu(false);
            }}
            title={month}
          />
        ))}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  yearButton: {
    flex: 1,
    borderColor: colors.primary,
  },
  monthButton: {
    flex: 2,
    borderColor: colors.primary,
  },
});