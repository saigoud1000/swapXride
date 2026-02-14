import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen name="login" options={{ title: 'Log In', presentation: 'modal' }} />
            <Stack.Screen name="signup" options={{ title: 'Sign Up', presentation: 'modal' }} />
        </Stack>
    );
}
