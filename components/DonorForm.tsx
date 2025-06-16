import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';
import { colors } from '../constants/theme';

interface DonorFormProps {
  onSubmit: (data: Omit<Donor, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<Donor>;
}

export function DonorForm({ onSubmit, isLoading, initialData }: DonorFormProps) {
  const [formData, setFormData] = useState({
    hundiNo: initialData?.hundiNo || '',
    name: initialData?.name || '',
    mobileNumber: initialData?.mobileNumber || '',
    address: initialData?.address || '',
    googleMapLink: initialData?.googleMapLink || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.hundiNo.trim()) {
      newErrors.hundiNo = 'Hundi number is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.googleMapLink.trim()) {
      newErrors.googleMapLink = 'Google Maps link is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const submissionData = {
          ...formData,
          date: new Date(formData.date).toISOString(),
        };
        await onSubmit(submissionData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
        Alert.alert('Error', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formFields}>
        <TextInput
          label="Hundi Number"
          value={formData.hundiNo}
          onChangeText={(text) => {
            setFormData({ ...formData, hundiNo: text });
            if (errors.hundiNo) {
              setErrors({ ...errors, hundiNo: '' });
            }
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.hundiNo}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.hundiNo}>
          {errors.hundiNo}
        </HelperText>

        <TextInput
          label="Name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData({ ...formData, name: text });
            if (errors.name) {
              setErrors({ ...errors, name: '' });
            }
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.name}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label="Mobile Number"
          value={formData.mobileNumber}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setFormData({ ...formData, mobileNumber: numericText });
            if (errors.mobileNumber) {
              setErrors({ ...errors, mobileNumber: '' });
            }
          }}
          mode="outlined"
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
          error={!!errors.mobileNumber}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.mobileNumber}>
          {errors.mobileNumber}
        </HelperText>

        <TextInput
          label="Address"
          value={formData.address}
          onChangeText={(text) => {
            setFormData({ ...formData, address: text });
            if (errors.address) {
              setErrors({ ...errors, address: '' });
            }
          }}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.multilineInput]}
          error={!!errors.address}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.address}>
          {errors.address}
        </HelperText>

        <TextInput
          label="Google Maps Link"
          value={formData.googleMapLink}
          onChangeText={(text) => {
            setFormData({ ...formData, googleMapLink: text });
            if (errors.googleMapLink) {
              setErrors({ ...errors, googleMapLink: '' });
            }
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.googleMapLink}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.googleMapLink}>
          {errors.googleMapLink}
        </HelperText>

        <TextInput
          label="Date"
          value={formData.date}
          onChangeText={(text) => {
            setFormData({ ...formData, date: text });
            if (errors.date) {
              setErrors({ ...errors, date: '' });
            }
          }}
          mode="outlined"
          style={styles.input}
          error={!!errors.date}
          disabled={isLoading}
          outlineColor={colors.primary}
          activeOutlineColor={colors.primary}
        />
        <HelperText type="error" visible={!!errors.date}>
          {errors.date}
        </HelperText>
      </View>

      <View style={styles.buttonSection}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {isSubmitting ? 'Adding Donor...' : 'Add Donor'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formFields: {
    padding: 16,
  },
  input: {
    backgroundColor: colors.background,
    marginBottom: 4,
    height: 48,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 8,
  },
  buttonSection: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
  },
  submitButtonContent: {
    height: 48,
  },
});