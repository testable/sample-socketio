#!/bin/bash

execution_id=$1
echo "[$(date)] Waiting for execution to complete (view online at https://a.testable.io/results/$execution_id)"
while [ $(curl -H "X-Testable-Key:$TESTABLE_KEY" --silent https://api.testable.io/executions/$execution_id | jq -r ".completed") = "false" ]; do
  echo -n "."
  sleep 5
done

details=$(curl -H "X-Testable-Key:$TESTABLE_KEY" --silent https://api.testable.io/executions/$execution_id)

latency=$(echo "$details" | jq -r '.summary.metrics | .[] | select(.metricDef=="firstReceivedMs") | .metricValueMap.p50')
total_outcomes=$(echo "$details" | jq -r '.summary.metrics | .[] | select(.metricDef=="outcome") | .metricValue')
success_outcomes=$(echo "$details" | jq -r '.summary.metrics | .[] | select(.metricDef=="outcome") | .metricValueMap.success')
let "success_rate=100*$success_outcomes/$total_outcomes"

echo "[$(date)] Median Response Time: ${latency}ms"
echo "[$(date)] Success Rate: ${success_rate}%"

epoch=$(date +"%s")
echo "[$(date)] Storing CSV results at results-$epoch.csv"
curl -H "X-Testable-Key:$TESTABLE_KEY" --silent https://api.testable.io/executions/$execution_id/results.csv > results-$epoch.csv

if [ $(echo "$details" | jq -r ".success") = "false" ]; then
  echo -e "\n[$(date)] Test FAILED"
  exit 1
else 
  echo -e "\n[$(date)] Test SUCCESS"
fi