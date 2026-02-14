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
if [ -f "target/swapxride-api-0.0.1-SNAPSHOT.jar" ]; then
    $JAVA_CMD -jar target/swapxride-api-0.0.1-SNAPSHOT.jar
else
    echo "⚠️  JAR not found. Building..."
    mvn package -DskipTests
    $JAVA_CMD -jar target/swapxride-api-0.0.1-SNAPSHOT.jar
fi
