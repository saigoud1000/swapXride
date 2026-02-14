// Jest setup file
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@stripe/stripe-react-native', () => ({
    StripeProvider: ({ children }) => children,
    useStripe: () => ({
        initPaymentSheet: jest.fn(),
        presentPaymentSheet: jest.fn(),
        confirmPayment: jest.fn(),
        createToken: jest.fn(),
    }),
}));
