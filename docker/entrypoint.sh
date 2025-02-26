#!/bin/sh
# Write environment variables to /app/.env
{
  echo "IP=${IP}"
  echo "TEST_IP=${TEST_IP}"
  echo "ODYSSEY_PORT=${ODYSSEY_PORT}"
  echo "PROTOCOL=${PROTOCOL}"
  echo "NETWORK_ID=${NETWORK_ID}"
  echo "TEST_NETWORK_ID=${TEST_NETWORK_ID}"
  echo "LOCAL_IP=${LOCAL_IP}"
  echo "LOCAL_PORT=${LOCAL_PORT}"
  echo "LOCAL_PROTOCOL=${LOCAL_PROTOCOL}"
  echo "LOCAL_NETWORK_ID=${LOCAL_NETWORK_ID}"
  echo "IP_INDEXER=${IP_INDEXER}"
  echo "PROTOCOL_WS=${PROTOCOL_WS}"
  echo "HOST=${HOST}"
  echo "PRIVATE_KEY1=${PRIVATE_KEY1}"
  echo "PUBLIC_KEY1=${PUBLIC_KEY1}"
  echo "STAKE_AMOUNT=${STAKE_AMOUNT}"
} > /app/.env

# Run the first command (combinedStake)
echo "Running combinedStake..."
npx ts-node ./examples/dockerization/combinedStake.ts

# Check if the first command succeeded before running the second
if [ $? -eq 0 ]; then
  echo "Running buildAddValidatorTx..."
  npx ts-node ./examples/omegavm/buildAddValidatorTx.ts
else
  echo "combinedStake failed. Aborting the second command."
  exit 1
fi

# If you need to run additional commands from CMD, you could uncomment the line below.
# exec "$@"
