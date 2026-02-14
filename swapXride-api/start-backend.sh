#!/bin/bash
# Script to start the backend with the correct Java version
# echo "Checking for Database connection..."
# if ! nc -z localhost 5432; then
#   echo "❌ Error: Postgres is not running on port 5432."
#   echo "👉 Please start Docker Desktop or your local Postgres service."
#   exit 1
# fi
echo "✅ Using Supabase Database."

echo "🚀 Starting Backend..."

# Use Java 17 package path
JAVA_CMD="/usr/local/Cellar/openjdk/17.0.1/libexec/openjdk.jdk/Contents/Home/bin/java"

# Always rebuild if source has changed (simple check) or just rely on manual rebuild commands.
# For now, we assume the user/agent runs mvn package when needed.

# Determine script directory to support running from root or inside subfolder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit

# Source .env file if it exists
if [ -f ".env" ]; then
  echo "📄 Loading environment variables from .env"
  # Use set -a to automatically export all variables
  set -a
  source .env
  set +a
fi

if [ ! -f "target/swapxride-api-0.0.1-SNAPSHOT.jar" ]; then
  echo "⚠️  JAR not found. Building..."
  mvn clean package -DskipTests
fi

exec $JAVA_CMD -jar target/swapxride-api-0.0.1-SNAPSHOT.jar
