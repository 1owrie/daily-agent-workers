#!/bin/bash

# OpenAI 配额检查脚本
# 使用方法: ./check-openai-status.sh

echo "🔍 检查 OpenAI API 状态..."
echo ""

# 从 .dev.vars 读取 API Key
if [ -f .dev.vars ]; then
    export $(cat .dev.vars | grep OPENAI_API_KEY | xargs)
else
    echo "❌ 找不到 .dev.vars 文件"
    exit 1
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY 未设置"
    exit 1
fi

echo "✅ API Key: ${OPENAI_API_KEY:0:20}..."
echo ""

# 测试 API 连接
echo "📡 测试 API 连接..."
response=$(curl -s -w "\n%{http_code}" https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo ""
if [ "$http_code" = "200" ]; then
    echo "✅ API Key 有效"
    echo "✅ 状态: 正常"
    echo ""
    echo "💡 提示:"
    echo "   - 访问 https://platform.openai.com/usage 查看详细使用情况"
    echo "   - 访问 https://platform.openai.com/account/billing 查看余额"
elif [ "$http_code" = "401" ]; then
    echo "❌ API Key 无效"
    echo "   错误: 认证失败"
    echo ""
    echo "💡 解决方案:"
    echo "   1. 检查 API Key 是否正确"
    echo "   2. 访问 https://platform.openai.com/api-keys 创建新 Key"
elif [ "$http_code" = "429" ]; then
    echo "⚠️  配额已用完"
    error_msg=$(echo "$body" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "   错误: $error_msg"
    echo ""
    echo "💡 解决方案:"
    echo "   1. 访问 https://platform.openai.com/account/billing/overview"
    echo "   2. 检查免费额度: Free trial usage"
    echo "   3. 如果已用完，添加付费方式"
    echo "   4. 或使用 Mock 模式: 在 .dev.vars 中设置 USE_MOCK_API=true"
else
    echo "❌ 请求失败"
    echo "   HTTP 状态码: $http_code"
    echo "   响应: $(echo "$body" | head -c 200)"
fi

echo ""
echo "🔗 有用的链接:"
echo "   - 使用统计: https://platform.openai.com/usage"
echo "   - 账单管理: https://platform.openai.com/account/billing"
echo "   - API Keys: https://platform.openai.com/api-keys"
