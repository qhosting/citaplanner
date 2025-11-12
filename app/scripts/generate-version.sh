#!/bin/bash
# Generate version file
VERSION="1.11.1"
DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

cat > lib/version.ts << 'EOL'
// Auto-generated file - Do not edit manually
export const APP_VERSION = '1.11.1';
export const BUILD_DATE = 'BUILD_DATE_PLACEHOLDER';
export const GIT_HASH = 'GIT_HASH_PLACEHOLDER';
EOL

# Replace placeholders
sed -i "s/BUILD_DATE_PLACEHOLDER/${DATE}/" lib/version.ts
sed -i "s/GIT_HASH_PLACEHOLDER/${GIT_HASH}/" lib/version.ts

echo "Version file generated: ${VERSION} (${GIT_HASH})"
