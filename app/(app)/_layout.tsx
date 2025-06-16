import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <Stack>
      <Stack.Screen
        name="donations/monthly"
        options={{
          title: "Monthly Donations",
          headerShown: false,
          presentation: 'card'
        }}
      />
    </Stack>
  );
}