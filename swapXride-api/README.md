# SwapXride API (Backend)

Welcome to the **SwapXride API**! This is a Spring Boot application serving as the backend for the SwapXride platform, interacting with a Supabase PostgreSQL database.

## Prerequisites

- **Java**: JDK 17
- **Maven**: 3.8+
- **Docker** (Optional, for containerized run)

## Configuration

Key environment variables (can be set in `application.properties` or environment):

- `SPRING_DATASOURCE_URL`: JDBC URL for Postgres (e.g., `jdbc:postgresql://host:5432/postgres`)
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation/validation

### Database (Supabase)
The application connects to a Supabase PostgreSQL instance. Ensure the `SPRING_DATASOURCE_` variables point to your Supabase credentials.

## Payment Testing (Stripe Sandbox)

When testing payments, use the following Stripe Sandbox cards:

| Card Brand | Card Number | CVC | Date |
| --- | --- | --- | --- |
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |

## Running Locally

1.  **Start the Backend**:
    You can use the provided helper script:
    ```bash
    ./start-backend.sh
    ```
    Or run directly with Maven:
    ```bash
    mvn spring-boot:run
    ```
    The server will start on port `8080`.

2.  **Build**:
    ```bash
    mvn clean package
    ```

3.  **Test**:
    ```bash
    mvn test
    ```

## Docker

To build and run the backend as a Docker container:

```bash
docker build -t swapxride-api .
docker run -p 8080:8080 swapxride-api
```
