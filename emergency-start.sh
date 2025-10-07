#!/bin/sh
echo "🚨 EMERGENCY START - Bypassing database checks"
echo "Starting Next.js server directly..."
cd /app
exec node server.js
