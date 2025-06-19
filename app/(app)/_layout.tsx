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
      <Stack.Screen
        name="groups/index"
        options={{
          title: 'Groups',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="groups/[id]"
        options={{
          title: 'Group Details',
          headerShown: false
        }}
      />
    </Stack>
  );
}