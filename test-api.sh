#!/bin/bash

# TrainerX API 测试脚本

BASE_URL="http://localhost:3000/api"

echo "💪 TrainerX API 测试"
echo "===================="
echo ""

# 测试健康检查
echo "1. 测试健康检查..."
curl -s "$BASE_URL/auth/verify" -X POST -H "Content-Type: application/json" -d '{"token":"test"}' | jq .

echo ""
echo "2. 测试微信登录（需要有效的 code）..."
curl -s "$BASE_URL/auth/wx-login" -X POST -H "Content-Type: application/json" -d '{"code":"test_code"}' | jq .

echo ""
echo "✅ API 测试完成！"
echo ""
echo "可用接口："
echo "  POST $BASE_URL/auth/wx-login     - 微信登录"
echo "  GET  $BASE_URL/auth/me           - 获取当前用户"
echo "  PUT  $BASE_URL/auth/profile      - 更新用户资料"
echo "  GET  $BASE_URL/coaches           - 教练列表"
echo "  GET  $BASE_URL/courses           - 课程列表"
echo "  POST $BASE_URL/bookings          - 创建预约"
echo "  POST $BASE_URL/checkins          - 创建打卡"
