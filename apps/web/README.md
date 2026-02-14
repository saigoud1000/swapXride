# SwapXride Web (Frontend)

This is the Next.js frontend application for **SwapXride**, built with modern web technologies including Tailwind CSS and Shadcn UI.

## Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later

## Installation

1.  Install dependencies:
    ```bash
    npm install
    # or from the root monorepo:
    npm install
    ```

## Running Locally

1.  **Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

2.  **Build**:
    ```bash
    npm run build
    ```

3.  **Start Production Server**:
    ```bash
    npm run start
    ```

## Configuration

Environment variables are managed via `.env` files.

- `NEXT_PUBLIC_SUPABASE_URL`: URL of your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key for Supabase
- `NEXT_PUBLIC_API_URL`: URL of the backend API

### Database (Supabase)
This frontend interacts with Supabase for specific direct features (e.g. Auth, real-time). Ensure the Supabase keys are correct.

### Payment Testing (Stripe Sandbox)
Use the following cards for testing Stripe payments:

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **Amex**: `3782 822463 10005`
*(Any future date, any 3/4 digit CVC)*

## Docker

To build the frontend container manually (from the project root):

```bash
docker build -f apps/web/Dockerfile .
```
