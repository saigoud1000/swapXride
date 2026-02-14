#!/bin/bash

echo "🛑 Stopping SwapXRide Development Environment..."

# Function to kill process on a specific port
kill_port() {
    PORT=$1
    NAME=$2
    PID=$(lsof -t -i:$PORT)
    
    if [ -z "$PID" ]; then
        echo "   Running check on port $PORT ($NAME)... No process found."
    else
        echo "   Killing $NAME on port $PORT (PID: $PID)..."
        kill -9 $PID
        echo "   ✅ Stopped $NAME"
    fi
}

# 1. Stop Backend
kill_port 8080 "Backend (API)"

# 2. Stop Web
kill_port 3000 "Web (Frontend)"

# 3. Stop Mobile
kill_port 8081 "Mobile (Metro Bundler)"

echo "👋 All services stopped!"
