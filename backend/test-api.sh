#!/bin/bash
set -e

# Start Server
node dist/server.js &
SERVER_PID=$!
sleep 2

echo "--- Testing Anonymous Auth ---"
AUTH_RES=$(curl -s -X POST http://localhost:3000/api/v1/auth/anonymous -H "Content-Type: application/json" -d '{"deviceId":"a8a25c61-0428-444a-867c-659f1eb96644"}')
echo $AUTH_RES
TOKEN=$(echo $AUTH_RES | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo -e "\n--- Testing Routine PUT ---"
curl -s -X PUT http://localhost:3000/api/v1/routine -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"id":"routine_1", "exercises": [{"name": "pushups", "type": "counter", "target": 50}]}'

echo -e "\n--- Testing Routine GET ---"
curl -s -X GET http://localhost:3000/api/v1/routine -H "Authorization: Bearer $TOKEN"

echo -e "\n--- Testing Logs PUT ---"
curl -s -X PUT http://localhost:3000/api/v1/logs/2026-04-09 -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"status":"completed", "completionPercentage":100, "exercisesSnapshot":[], "lastUpdated": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}'

echo -e "\n--- Testing Logs GET ---"
curl -s -X GET http://localhost:3000/api/v1/logs -H "Authorization: Bearer $TOKEN"

kill $SERVER_PID
