#!/bin/bash

# 🧪 CI/CD Local Testing Script
# ทดสอบ commands ที่ CI จะรันใน local

set -e  # Exit on error

echo "🧪 Testing CI/CD locally..."
echo "================================"
echo ""

# Change to backend directory
cd backend

echo "📦 Step 1: Installing dependencies..."
echo "-----------------------------------"
npm ci
echo "✅ Dependencies installed successfully"
echo ""

echo "🔧 Step 2: Generating Prisma Client..."
echo "-----------------------------------"
npx prisma generate
echo "✅ Prisma Client generated successfully"
echo ""

echo "🔍 Step 3: Running linter..."
echo "-----------------------------------"
npm run lint
echo "✅ Linter passed"
echo ""

echo "🧪 Step 4: Running tests..."
echo "-----------------------------------"
npm run test
echo "✅ Tests passed"
echo ""

echo "================================"
echo "✅ All CI checks passed!"
echo "================================"
echo ""
echo "💡 Next step: Push code to GitHub to test CI/CD in Actions"
echo ""
