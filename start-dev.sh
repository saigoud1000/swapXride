#!/bin/bash

# Define the Java 17 path (Adjust if necessary)
JAVA_CMD="/usr/local/Cellar/openjdk/17.0.1/libexec/openjdk.jdk/Contents/Home/bin/java"

echo "🚗 Starting SwapXRide Development Environment..."

# 1. Start Backend (API)
echo "Starting Backend (Port 8080)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/swapXride-api\" && echo \"Starting Backend...\" && [ -f .env ] && source .env; \"'$JAVA_CMD'\" -jar target/swapxride-api-0.0.1-SNAPSHOT.jar"'

# 2. Start Web (Frontend)
echo "Starting Web (Port 3000)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/apps/web\" && echo \"Starting Web App...\" && npm run dev"'

# 3. Start Mobile (React Native)
echo "Starting Mobile (Port 8081)..."
osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/apps/mobile\" && echo \"Starting Mobile App...\" && npx expo start --clear"'

echo "✅ All services launched in new Terminal tabs!"
