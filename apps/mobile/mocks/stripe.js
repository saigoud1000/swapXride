const React = require('react');
const { View } = require('react-native');

module.exports = {
    StripeProvider: ({ children }) => children,
    useStripe: () => ({
        initPaymentSheet: async () => {
            console.warn('[Stripe Mock] initPaymentSheet called on Web');
            return { error: null };
        },
        presentPaymentSheet: async () => {
            alert('Stripe payments are not supported in the Web Preview. Please run on a Device/Simulator.');
            return { error: null };
        },
        confirmPayment: async () => {
            console.warn('[Stripe Mock] confirmPayment called on Web');
            return { error: null };
        }
    }),
};
