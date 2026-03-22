#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-feat/test-connection}"
APP_NAME="${APP_NAME:-learningfaster}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$REPO_DIR"

echo "[1/6] Fetch origin..."
git fetch origin

echo "[2/6] Hard reset to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

echo "[3/6] Remove untracked files..."
git clean -fd

echo "[4/6] Install dependencies..."
npm install

echo "[5/6] Build app..."
npm run build

echo "[6/6] Restart PM2 app: ${APP_NAME}..."
pm2 restart "${APP_NAME}"

echo "Done. Server is now synced with origin/${BRANCH}."
