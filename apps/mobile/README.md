# SwapXride Mobile App

This is the React Native mobile application for **SwapXride**, built with **Expo**.

## Prerequisites

- **Node.js**: 18.x or later
- **Expo Go** app on your physical device OR Android Studio / Xcode for emulators.

## Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the App**:
    ```bash
    npx expo start
    ```
    Scan the QR code with Expo Go (Android) or the Camera app (iOS).

3.  **Run with Docker (Web Build)**:
    To run the web version of the mobile app in a container:
    ```bash
    docker build -f apps/mobile/Dockerfile .
    ```

## Configuration

### Database (Supabase)
This app uses Supabase for the backend database. Configuration is handled via environment variables (see `.env` or project config).

### Payment Testing (Stripe Sandbox)

Use the following test card numbers for Sandbox mode:

| Card Brand | Card Number | CVC | Date |
| --- | --- | --- | --- |
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Visa (debit) | 4000 0566 5566 5556 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |
| Discover | 6011 1111 1111 1117 | Any 3 digits | Any future date |
*(See full Stripe testing docs for more)*

---

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).
