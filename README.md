# SwapXride - Car Swap & Sell Platform

Welcome to **SwapXride**, a comprehensive platform for car enthusiasts to swap or sell their vehicles. This monorepo contains both the backend API and the frontend applications (web & mobile).

## Project Structure

- **`apps/web`**: Next.js frontend web application.
- **`apps/mobile`**: React Native (Expo) mobile application.
- **`swapXride-api`**: Java Spring Boot backend API.
- **`packages`**: Shared libraries and configuration.

## Development & Testing Rules

### 1. Automated Testing (MANDATORY: NO REAL DATA)
All automation tests (Unit, Integration, E2E) **MUST** run with mock data using the in-memory H2 database.
- **Backend Tests**: `mvn test` (Automatically uses `application-test.properties`)
- **Web E2E**: `mvn spring-boot:run -Dspring-boot.run.profiles=e2e` (Uses `application-e2e.properties`) + `npx playwright test`
- **Mobile Tests**: `npm test` (Uses Jest mocks)

> [!CAUTION]
> **NEVER** run automated tests against the production/Supabase database. The test suite performs `deleteAll()` operations which will wipe your data.

### 2. Local Development (REAL DATA)
For manual testing and feature development, use the real Supabase database.
- **Backend**: `mvn spring-boot:run` (Default profile uses `application.properties` -> Supabase)
- **Web**: `npm run dev` (Connects to localhost:8080)
- **Mobile**: `npx expo start` (Connects to localhost:8080)


## Quick Start (Docker)

The easiest way to run the full stack (Backeend + Frontend) is using Docker Compose.

1.  **Prerequisites**: Ensure you have [Docker](https://www.docker.com/) installed and running.
2.  **Environment**: Ensure you have a valid `.env` file or environment variables set for Supabase and Stripe.
3.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    This will start:
    - **Backend API**: [http://localhost:8080](http://localhost:8080)
    - **Web Frontend**: [http://localhost:3000](http://localhost:3000)

## Payment Testing (Stripe)

We use Stripe Sandbox for payments. You can use the following test cards:

| Card Brand | Card Number | CVC | Date |
| --- | --- | --- | --- |
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Visa (debit) | 4000 0566 5566 5556 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| Mastercard (2-series) | 2223 0031 2200 3222 | Any 3 digits | Any future date |
| Mastercard (debit) | 5200 8282 8282 8210 | Any 3 digits | Any future date |
| Mastercard (prepaid) | 5105 1051 0510 5100 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |
| American Express | 3714 496353 98431 | Any 4 digits | Any future date |
| Discover | 6011 1111 1111 1117 | Any 3 digits | Any future date |

## Manual Setup

If you prefer to run services individually, please refer to their respective READMEs:

- [Backend Documentation](./swapXride-api/README.md)
- [Web Frontend Documentation](./apps/web/README.md)
- [Mobile App Documentation](./apps/mobile/README.md)
