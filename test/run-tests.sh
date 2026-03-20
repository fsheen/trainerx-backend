#!/bin/bash

# TrainerX 后端测试运行脚本

echo "======================================"
echo "  TrainerX Backend - 自动化测试"
echo "======================================"
echo ""

# 检查环境变量
if [ ! -f .env ]; then
  echo "⚠️  未找到 .env 文件，使用默认配置"
  echo "DATABASE_URL=mysql://root:password@localhost:3306/trainerx_test"
  export DATABASE_URL="mysql://root:password@localhost:3306/trainerx_test"
else
  echo "✅ 加载 .env 配置"
  export $(cat .env | grep -v '^#' | xargs)
fi

echo ""
echo "📦 安装依赖..."
npm ci --only=dev

echo ""
echo "🔨 生成 Prisma Client..."
npx prisma generate

echo ""
echo "🧪 运行单元测试..."
npm run test

echo ""
echo "🧪 运行 E2E 测试..."
npm run test:e2e

echo ""
echo "📊 生成测试覆盖率报告..."
npm run test:cov

echo ""
echo "======================================"
echo "  测试完成！"
echo "  覆盖率报告：coverage/index.html"
echo "======================================"
