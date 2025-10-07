
#!/bin/sh
set -e  # Exit on any error
set -x  # Print all commands

echo "=========================================="
echo "🚀 Building Next.js app with standalone output..."
echo "=========================================="

# Ensure we're in the app directory
echo "📂 Checking current directory..."
pwd
ls -la
cd /app || { echo "❌ FATAL: Cannot cd to /app"; exit 1; }
echo "✅ Changed to /app directory"
pwd

# Verify essential files exist
echo "🔍 Verifying essential files..."
if [ ! -f "package.json" ]; then
    echo "❌ FATAL: package.json not found!"
    exit 1
fi
if [ ! -f "next.config.js" ]; then
    echo "❌ FATAL: next.config.js not found!"
    exit 1
fi
echo "✅ Essential files verified"

# Check Node and Yarn versions
echo "🔍 Checking Node and Yarn versions..."
node --version || { echo "❌ FATAL: Node not found"; exit 1; }
yarn --version || { echo "❌ FATAL: Yarn not found"; exit 1; }

# Force standalone output configuration
echo "=========================================="
echo "🔧 Configuring Next.js for standalone output..."
echo "=========================================="

echo "📄 Current next.config.js content:"
cat next.config.js

node -e "
const fs = require('fs');
const path = require('path');

try {
  console.log('🔧 Reading next.config.js...');
  const configPath = './next.config.js';
  let content = fs.readFileSync(configPath, 'utf8');

  console.log('📋 Original config output setting:', content.match(/output.*,/));

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
  
  // Verify the change
  const updatedContent = fs.readFileSync(configPath, 'utf8');
  console.log('📋 Updated config output setting:', updatedContent.match(/output.*,/));
} catch (error) {
  console.error('❌ FATAL ERROR in config update:', error);
  process.exit(1);
}
" || { echo "❌ FATAL: Config update failed"; exit 1; }

# Verify the configuration
echo "=========================================="
echo "🔍 Verifying Next.js configuration..."
echo "=========================================="
echo "📄 Updated next.config.js content:"
cat next.config.js
grep -n "output:" next.config.js || echo "⚠️ Output config not found in grep"

# Check node_modules
echo "=========================================="
echo "🔍 Checking node_modules..."
echo "=========================================="
if [ ! -d "node_modules" ]; then
    echo "❌ FATAL: node_modules directory not found!"
    exit 1
fi
echo "✅ node_modules exists"
ls -la node_modules | head -20

# Run the build
echo "=========================================="
echo "🏗️ Starting Next.js build..."
echo "=========================================="
yarn build || { 
    echo "❌ FATAL: yarn build failed with exit code $?"
    echo "📋 Checking for any .next directory..."
    ls -la .next/ 2>/dev/null || echo "No .next directory found"
    exit 1
}

echo "✅ yarn build completed successfully"

# Verify standalone directory was created
echo "=========================================="
echo "🔍 Verifying build output..."
echo "=========================================="

if [ -d ".next/standalone" ]; then
    echo "✅ Standalone build successful! Directory created."
    echo "📋 Contents of .next/standalone:"
    ls -la .next/standalone
    
    # Verify server.js exists specifically
    if [ -f ".next/standalone/server.js" ]; then
        echo "✅ server.js found in standalone directory!"
        ls -la .next/standalone/server.js
        echo "📋 File permissions and owner:"
        stat .next/standalone/server.js
    else
        echo "❌ ERROR: server.js NOT FOUND in standalone directory!"
        echo "📋 Searching for server.js anywhere in .next:"
        find .next -name "server.js" -type f | head -5
    fi
    
    echo "📋 Complete structure of .next/standalone:"
    find .next/standalone -type f | head -20
else
    echo "❌ ERROR: Standalone directory not created!"
    echo "📋 Contents of .next directory:"
    ls -la .next/
    exit 1
fi

echo "=========================================="
echo "🎉 Build completed successfully with standalone output!"
echo "=========================================="
