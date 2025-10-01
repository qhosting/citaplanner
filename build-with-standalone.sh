
#!/bin/sh

echo "🚀 Building Next.js app with standalone output..."

# Ensure we're in the app directory
cd /app || exit 1

# Force standalone output configuration
echo "🔧 Configuring Next.js for standalone output..."
node -e "
const fs = require('fs');
const path = require('path');

// Read current next.config.js
const configPath = './next.config.js';
let content = fs.readFileSync(configPath, 'utf8');

console.log('Original config output setting:', content.match(/output.*,/));

// Force standalone output
content = content.replace(
  /output:\s*process\.env\.NEXT_OUTPUT_MODE,?/g,
  'output: \\'standalone\\','
);

// Ensure standalone is set
if (!content.includes('output:')) {
  content = content.replace(
    'const nextConfig = {',
    'const nextConfig = {\n  output: \\'standalone\\','
  );
}

fs.writeFileSync(configPath, content);
console.log('✅ Next.js config updated for standalone output');
"

# Verify the configuration
echo "🔍 Verifying Next.js configuration..."
grep -n "output:" next.config.js || echo "⚠️ Output config not found"

# Run the build
echo "🏗️ Starting Next.js build..."
yarn build

# Determine the build directory (could be .next or .build based on NEXT_DIST_DIR)
BUILD_DIR="${NEXT_DIST_DIR:-.next}"

# Verify standalone directory was created
if [ -d "$BUILD_DIR/standalone" ]; then
    echo "✅ Standalone build successful! Directory created at $BUILD_DIR/standalone"
    echo "📋 Contents of $BUILD_DIR/standalone:"
    ls -la "$BUILD_DIR/standalone"
    
    # Verify server.js exists (could be in standalone/ or standalone/app/)
    if [ -f "$BUILD_DIR/standalone/server.js" ] || [ -f "$BUILD_DIR/standalone/app/server.js" ]; then
        echo "✅ server.js found in standalone directory!"
        find "$BUILD_DIR/standalone" -name "server.js" -type f -exec ls -la {} \;
    else
        echo "❌ ERROR: server.js NOT FOUND in standalone directory!"
        echo "📋 Searching for server.js anywhere in $BUILD_DIR:"
        find "$BUILD_DIR" -name "server.js" -type f | head -5
    fi
    
    echo "📋 Complete structure of $BUILD_DIR/standalone:"
    find "$BUILD_DIR/standalone" -type f | head -20
else
    echo "❌ ERROR: Standalone directory not created!"
    ls -la "$BUILD_DIR/" || ls -la .
    exit 1
fi

echo "🎉 Build completed successfully with standalone output!"
