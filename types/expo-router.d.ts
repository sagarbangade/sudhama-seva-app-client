import { Router as ExpoRouter } from 'expo-router';

declare module 'expo-router' {
  export type AuthRoutes = '/(auth)/login' | '/(auth)/register';
  export type TabRoutes = '/(tabs)' | '/(tabs)/explore' | '/(tabs)/profile';
  export type AppRoutes = AuthRoutes | TabRoutes;

  export interface Router extends ExpoRouter {
    push: (route: AppRoutes) => void;
    replace: (route: AppRoutes) => void;
  }

  export function useSegments(): string[];
  export const router: Router;
} 