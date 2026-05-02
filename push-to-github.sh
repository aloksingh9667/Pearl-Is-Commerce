#!/usr/bin/env bash
# Run this script once from the Replit Shell to push the code to both GitHub repos.
# Usage: bash push-to-github.sh

set -e

TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-}"
GITHUB_USERNAME="aloksingh9667"

if [ -z "$TOKEN" ]; then
  echo "Error: GITHUB_PERSONAL_ACCESS_TOKEN is not set."
  exit 1
fi

echo "Setting up remotes..."
git remote remove pearlis-backend 2>/dev/null || true
git remote remove pearlis-frontend 2>/dev/null || true

git remote add pearlis-backend "https://${GITHUB_USERNAME}:${TOKEN}@github.com/${GITHUB_USERNAME}/pearlis-backend.git"
git remote add pearlis-frontend "https://${GITHUB_USERNAME}:${TOKEN}@github.com/${GITHUB_USERNAME}/pearlis-frontend.git"

echo "Pushing to pearlis-backend..."
git push pearlis-backend main

echo "Pushing to pearlis-frontend..."
git push pearlis-frontend main

echo ""
echo "Done! Both repos are up to date:"
echo "  Backend:  https://github.com/${GITHUB_USERNAME}/pearlis-backend"
echo "  Frontend: https://github.com/${GITHUB_USERNAME}/pearlis-frontend"
