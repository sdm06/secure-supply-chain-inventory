#!/bin/sh
set -e

echo "==> container starting (secure-supply-chain-inventory)"
cat /etc/os-release | grep PRETTY_NAME || true

echo "==> applying database migrations"
node_modules/.bin/prisma migrate deploy

echo "==> starting Next.js production server"
exec node node_modules/next/dist/bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
