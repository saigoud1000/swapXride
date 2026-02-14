import 'react-native-url-polyfill/auto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { AuthProvider } from '@/components/auth-provider';

import { ThemeProvider as AppThemeProvider, useTheme } from '@/components/theme-provider';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutNav />
    </AppThemeProvider>
  );
}

import { StripeProvider } from '@stripe/stripe-react-native';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <StripeProvider
      publishableKey="pk_test_51SvnmUQ420A7Y8yMoHEOXuq3Jub3sxTjDk8jRkFJHx6sLIehALjCYViZnhmxn0SlvQeVkQUmkvYpn8tgYkiQEALl00xAGlKa1P"
      merchantIdentifier="merchant.com.carswap.mobile"
      urlScheme="mobile"
    >
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="saved-listings" options={{ presentation: 'card', title: 'Saved Listings' }} />
            <Stack.Screen name="my-listings" options={{ presentation: 'card', title: 'My Listings' }} />
            <Stack.Screen name="listings/[id]" options={{ presentation: 'card', title: 'Listing Details' }} />
            <Stack.Screen name="payment/modal" options={{ presentation: 'modal', title: 'Payment' }} />
            <Stack.Screen name="payment/dealer" options={{ presentation: 'card', title: 'Buy Credits' }} />
          </Stack>
        </AuthProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </StripeProvider>
  );
}
