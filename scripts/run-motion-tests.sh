#!/bin/bash

##
# Motion Testing Framework - Quick Start Script
#
# This script runs the automated motion testing suite and opens results.
##

set -e

echo "🎬 Motion Testing Framework"
echo "======================================"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Dev server not running!"
    echo "   Starting dev server..."
    npm run dev > /dev/null 2>&1 &
    DEV_PID=$!

    echo "   Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null; then
            echo "   ✅ Server ready!"
            break
        fi
        sleep 1
    done
fi

echo ""
echo "🧪 Running motion tests..."
echo ""

# Run tests
npm run test:motion

TEST_EXIT_CODE=$?

echo ""
echo "======================================"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed"
fi

echo ""
echo "📊 Results:"
echo "   HTML Report: test-results/motion-report/index.html"
echo "   Videos: test-results/**/video.webm"
echo ""

# Ask if user wants to open report
read -p "Open HTML report? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run test:motion:report
fi

# Ask if user wants to open videos
echo ""
read -p "Open test videos? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening videos..."
    open test-results/**/video.webm 2>/dev/null || echo "No videos found (tests may have passed without recording)"
fi

# Cleanup dev server if we started it
if [ ! -z "$DEV_PID" ]; then
    echo ""
    echo "Stopping dev server..."
    kill $DEV_PID 2>/dev/null || true
fi

echo ""
echo "Done! 🎉"
echo ""

exit $TEST_EXIT_CODE
