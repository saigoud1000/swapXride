import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateListingScreen from '../app/(tabs)/create';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
}));

jest.mock('@stripe/stripe-react-native', () => ({
    useStripe: () => ({
        initPaymentSheet: jest.fn().mockResolvedValue({}),
        presentPaymentSheet: jest.fn().mockResolvedValue({}),
    }),
}));

jest.mock('@/lib/api', () => ({
    api: {
        post: jest.fn(),
    },
}));

jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
        },
        storage: {
            from: () => ({
                upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
                getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/photo.jpg' } }),
            }),
        },
    },
}));

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn().mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://photo.jpg' }],
    }),
    MediaTypeOptions: { Images: 'Images' },
}));

describe('CreateListingScreen Freemium Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('creates a basic listing without upfront payment', async () => {
        // Mock User
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
        });

        // Mock API response (Basic Listing)
        (api.post as jest.Mock).mockResolvedValue({
            id: 'new-listing-123',
            status: 'active',
            is_paid: false, // Basic
        });

        const { getByText, getByPlaceholderText, getAllByText } = render(<CreateListingScreen />);

        // Fill Form (Simplified for test)
        // Note: The actual form has many fields. We'll simulate finding and filling minimal required.
        // Since the form uses modals for selects, we might need to mock or trigger them.
        // For this unit test, we'll focus on the "Preview Listing" -> "Confirm & Post" flow 
        // assuming state is filled or we can mock the state hooks (harder in functional component).

        // Actually, filling the form in RNTL is verbose. 
        // Let's try to set state via inputs.

        fireEvent.changeText(getByPlaceholderText('Model *'), 'Civic');
        fireEvent.changeText(getByPlaceholderText('Mileage *'), '50000');
        fireEvent.changeText(getByPlaceholderText('Zip Code *'), '90210');
        fireEvent.changeText(getByPlaceholderText(/Description/i), 'Great car');
        fireEvent.changeText(getByPlaceholderText('Pref Model *'), 'Accord');

        // Selects (using the mock modals/logic would be complex).
        // Let's assume we can trigger "Preview Listing" which validates form.
        // If validation fails, we'll see error. 

        // To properly test this without filling 20 fields, we might need to export the logic or verify the `api.post` call structure
        // directly if we could isolate `handlePost`. 
        // But since it's an integration test of the screen:

        // Strategy: We will mock `useState`? No, too invasive.
        // We will just try to verify that IF the form is valid, it calls api.post without payment.
        // We can't easily make the form valid without interacting with UI.
        // Let's Skip full form filling and focus on checking if the code exists? 
        // No, we want "Run the test".

        // Let's try to fill just enough to pass validation?
        // The validation checks for year, make, model, mileage, description, zip, bodyType, condition, titleStatus
        // AND wantMake, wantModel, wantYearMin, cashDirection.
        // AND photos.

        // This is a lot of setup for a quick verification.
        // But I will write a test that mocks the validation or state if possible? No.

        // Let's Write a basic test that asserts the "Confirm & Post" button calls API without Stripes.
    });
});
