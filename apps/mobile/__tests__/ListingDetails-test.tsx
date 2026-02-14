import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ListingDetailsScreen from '../app/listings/[id]';

// Mock Expo Router
jest.mock('expo-router', () => ({
    useLocalSearchParams: () => ({ id: '123' }),
    useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
    Stack: {
        Screen: () => null,
    },
}));

// Mock API
const mockListing = {
    id: '123',
    have_year: 2020,
    have_make: 'Toyota',
    have_model: 'Camry',
    have_trim: 'SE',
    location_zip: '90001',
    have_mileage: 30000,
    description: 'Great car',
    photos: [{ url: 'http://example.com/photo.jpg' }],
    user_info: { display_name: 'Test Seller' },
};

jest.mock('@/lib/api', () => ({
    api: {
        get: jest.fn(() => Promise.resolve(mockListing)),
    },
}));

// Mock Theme Provider
jest.mock('@/components/theme-provider', () => ({
    useTheme: () => ({ colorScheme: 'light' }),
    useColorScheme: () => 'light',
}));

// Mock Icon Symbol
jest.mock('@/components/ui/icon-symbol', () => ({
    IconSymbol: () => 'Icon',
    __esModule: true,
    default: 'Icon', // Handling both export types just in case
}));


test('renders listing details correctly', async () => {
    const { getByText, queryByText, findByText } = render(<ListingDetailsScreen />);

    // Initially renders loading?
    // Since effect runs immediately, we wait for data
    // Check loading state first if possible, or straight to content
    // findByText has built-in waitFor
    expect(await findByText('2020 Toyota Camry SE')).toBeTruthy();
    expect(await findByText('Great car')).toBeTruthy();
    expect(await findByText('Test Seller')).toBeTruthy();
});
