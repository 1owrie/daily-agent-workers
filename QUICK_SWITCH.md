# 🚀 快速切换 AI 服务

## 当前配置

你的 `.dev.vars` 现在已设置为 **Mock 模式**，可以立即测试功能而不需要真实的 API。

## 💡 三种使用模式

### 模式 1: Mock 模式（当前）✅

**无需任何 API Key，立即可用**

```bash
# .dev.vars
USE_MOCK_API=true
```

**特点**：
- ✅ 完全免费
- ✅ 不需要网络
- ✅ 响应速度快
- ❌ 返回固定的测试消息

**适用场景**：
- 测试界面和功能
- 演示项目
- 开发调试

---

### 模式 2: OpenAI（付费）💰

**需要有余额的 OpenAI API Key**

```bash
# .dev.vars
USE_MOCK_API=false
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1
```

**成本**：约 $0.001 - $0.002 每次对话

**如何获取余额**：
1. 访问 https://platform.openai.com/account/billing
2. 添加信用卡
3. 充值（建议 $10 起）

---

### 模式 3: 免费/便宜的替代服务 🆓

#### 选项 A: DeepSeek（推荐，价格低）

**比 OpenAI 便宜 90%，质量相当**

1. 注册：https://platform.deepseek.com/
2. 获取 API Key
3. 配置：

```bash
# .dev.vars
USE_MOCK_API=false
OPENAI_API_KEY=your-deepseek-api-key
OPENAI_MODEL=deepseek-chat
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

**价格**：约 $0.0001 每次对话（10倍便宜！）

#### 选项 B: 硅基流动（中国服务商，有免费额度）

1. 注册：https://cloud.siliconflow.cn/
2. 新用户通常有免费额度
3. 配置：

```bash
# .dev.vars
USE_MOCK_API=false
OPENAI_API_KEY=your-siliconflow-key
OPENAI_MODEL=Qwen/Qwen2.5-7B-Instruct
OPENAI_BASE_URL=https://api.siliconflow.cn/v1
```

#### 选项 C: Groq（速度极快，有免费额度）

1. 注册：https://console.groq.com/
2. 免费额度：每天 14,400 请求
3. 配置：

```bash
# .dev.vars
USE_MOCK_API=false
OPENAI_API_KEY=your-groq-api-key
OPENAI_MODEL=llama3-8b-8192
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```

## 📋 快速切换命令

### 切换到 Mock 模式
```bash
# 编辑 .dev.vars
USE_MOCK_API=true

# 重启 Workers（如果正在运行）
# Ctrl+C 停止，然后：
npm run dev
```

### 切换到真实 API
```bash
# 编辑 .dev.vars
USE_MOCK_API=false
OPENAI_API_KEY=your-actual-api-key
OPENAI_BASE_URL=https://api.your-service.com/v1

# 重启 Workers
npm run dev
```

## 🎯 推荐的学习路径

### 第 1 天：熟悉功能（Mock 模式）
```bash
USE_MOCK_API=true
```
- 测试所有功能
- 熟悉界面
- 修改代码

### 第 2-3 天：测试真实 AI（免费服务）
```bash
# 使用 Groq 免费额度
USE_MOCK_API=false
OPENAI_BASE_URL=https://api.groq.com/openai/v1
```
- 体验真实 AI 对话
- 测试不同模型
- 优化提示词

### 第 4 天及以后：生产部署
根据需求和预算选择：
- **学习/个人项目**：继续用免费服务
- **商业项目**：考虑付费 OpenAI 或 DeepSeek

## 💰 成本对比（1000 次对话）

| 服务 | 成本 | 质量 | 速度 |
|------|------|------|------|
| Mock | $0 | - | ⚡⚡⚡ |
| Groq | $0 (免费额度内) | ⭐⭐⭐⭐ | ⚡⚡⚡ |
| DeepSeek | ~$0.10 | ⭐⭐⭐⭐ | ⚡⚡ |
| OpenAI GPT-3.5 | ~$1-2 | ⭐⭐⭐⭐⭐ | ⚡⚡ |
| OpenAI GPT-4 | ~$10-20 | ⭐⭐⭐⭐⭐ | ⚡ |

## 🔧 一键切换脚本（高级）

创建 `switch-api.sh`：

```bash
#!/bin/bash

echo "选择 AI 服务："
echo "1) Mock 模式（免费，测试）"
echo "2) DeepSeek（便宜）"
echo "3) Groq（免费额度）"
echo "4) OpenAI（付费）"

read -p "输入选项 (1-4): " choice

case $choice in
  1)
    sed -i '' 's/USE_MOCK_API=.*/USE_MOCK_API=true/' .dev.vars
    echo "✅ 已切换到 Mock 模式"
    ;;
  2)
    sed -i '' 's/USE_MOCK_API=.*/USE_MOCK_API=false/' .dev.vars
    sed -i '' 's|OPENAI_BASE_URL=.*|OPENAI_BASE_URL=https://api.deepseek.com/v1|' .dev.vars
    echo "✅ 已切换到 DeepSeek"
    ;;
  3)
    sed -i '' 's/USE_MOCK_API=.*/USE_MOCK_API=false/' .dev.vars
    sed -i '' 's|OPENAI_BASE_URL=.*|OPENAI_BASE_URL=https://api.groq.com/openai/v1|' .dev.vars
    echo "✅ 已切换到 Groq"
    ;;
  4)
    sed -i '' 's/USE_MOCK_API=.*/USE_MOCK_API=false/' .dev.vars
    sed -i '' 's|OPENAI_BASE_URL=.*|OPENAI_BASE_URL=https://api.openai.com/v1|' .dev.vars
    echo "✅ 已切换到 OpenAI"
    ;;
esac

echo "请重启 Workers 服务：npm run dev"
```

使用：
```bash
chmod +x switch-api.sh
./switch-api.sh
```

## 📚 更多信息

- [API Key 问题排查](API_KEY_TROUBLESHOOTING.md)
- [故障排查指南](TROUBLESHOOTING.md)
- [README](README.md)

---

**当前状态**：Mock 模式已启用 ✅
**操作**：重启 Workers 即可立即测试！
