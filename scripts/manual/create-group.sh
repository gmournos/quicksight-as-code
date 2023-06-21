#!/bin/bash

# List users to troubleshoot
# aws quicksight list-users --aws-account-id "$ACCOUNT" --namespace default

# set -e
DEV_GROUP_NAME="QS-Developers"

aws quicksight create-group --aws-account-id "$ACCOUNT" --namespace default --group-name "$DEV_GROUP_NAME"

for usr in "user1" "user2" "user3"; do
    aws quicksight create-group-membership --aws-account-id "$ACCOUNT" --namespace default --group-name "$DEV_GROUP_NAME" --member-name "${usr}"
done

