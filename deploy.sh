#!/bin/bash

# Production deployment script for Radar Chart Widget

echo "🚀 Starting production deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies (in case anything changed)
echo "📦 Installing dependencies..."
npm ci --silent

# Check if terser is available
if npm ls terser > /dev/null 2>&1; then
    echo "✅ Terser is available for minification"
else
    echo "⚠️  Terser not found, using esbuild for minification"
fi

# Type check
echo "🔍 Running type check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ Type check failed. Please fix TypeScript errors."
    exit 1
fi

# Build for production
echo "🏗️  Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the console output."
    echo "💡 Common fixes:"
    echo "   - Run 'npm install terser' if using terser minification"
    echo "   - Check Vite configuration for compatibility issues"
    echo "   - Ensure all TypeScript errors are resolved"
    exit 1
fi

# Check if build directory exists and has content
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output:"
    ls -la dist/
    
    # Show build size
    echo "📊 Build size:"
    du -sh dist/
    
    # Optional: Start preview server
    echo ""
    echo "🌐 Starting preview server..."
    echo "📖 View your app at: http://localhost:4173/vigilant-guacamole/"
    echo "🔗 With sample data: http://localhost:4173/vigilant-guacamole/?bewegung=7&ernaehrung_genuss=5&stress_erholung=3&geist_emotion=8&lebenssinn_qualitaet=6&umwelt_soziales=4"
    echo ""
    echo "Press Ctrl+C to stop the preview server"
    npm run preview
else
    echo "❌ Build directory is empty or doesn't exist"
    exit 1
fi
