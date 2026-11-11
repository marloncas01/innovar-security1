#!/bin/bash
set -e

export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"

cd /home/yeison_r/innovar-security

echo "🚀 Starting server..."
node ./node_modules/next/dist/bin/next start -p 3000 &>/tmp/next-server.log &
SERVER_PID=$!
sleep 5

echo "🧪 Running Phase 3 tests..."
node --import ./node_modules/tsx/dist/esm/index.mjs ./test-fase3.js 2>&1
RESULT=$?

kill $SERVER_PID 2>/dev/null || true
exit $RESULT
