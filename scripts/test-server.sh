#!/bin/bash

# Test Server Management Script
# Handles starting/stopping production server for Playwright tests

ACTION=${1:-"start"}
PORT=${2:-3002}

case "$ACTION" in
  start)
    echo "🏗️  Building production..."
    npm run build > /dev/null 2>&1

    echo "🚀 Starting production server on port $PORT..."
    npx serve dist -p $PORT > /dev/null 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > .test-server.pid

    # Wait for server to be ready
    sleep 2

    if curl -s http://localhost:$PORT > /dev/null; then
      echo "✅ Production server running (PID: $SERVER_PID)"
      echo "   URL: http://localhost:$PORT"
    else
      echo "❌ Failed to start server"
      exit 1
    fi
    ;;

  stop)
    if [ -f .test-server.pid ]; then
      PID=$(cat .test-server.pid)
      kill $PID 2>/dev/null && echo "✅ Production server stopped (PID: $PID)" || echo "⚠️  Server not running"
      rm .test-server.pid
    else
      echo "⚠️  No server PID file found"
    fi
    ;;

  restart)
    $0 stop
    $0 start $PORT
    ;;

  *)
    echo "Usage: $0 {start|stop|restart} [port]"
    echo "  start   - Build and start production server (default port: 3002)"
    echo "  stop    - Stop production server"
    echo "  restart - Restart production server"
    exit 1
    ;;
esac
