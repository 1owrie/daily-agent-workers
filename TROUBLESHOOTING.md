# 🔧 故障排查指南

## OpenAI API 错误

### 错误 429: 配额超限

**错误消息**：
```
You exceeded your current quota, please check your plan and billing details.
```

**原因**：
- OpenAI API Key 的配额已用完
- 免费试用额度已耗尽
- 付费账户余额不足

**解决方案**：

#### 方案 1: 检查并充值账户（推荐）

1. 访问 [OpenAI 账单页面](https://platform.openai.com/account/billing)
2. 检查当前余额和使用情况
3. 如果余额不足，添加支付方式并充值
4. 等待几分钟后重试

#### 方案 2: 使用 Mock 模式测试（临时）

在 `.dev.vars` 中设置：
```bash
USE_MOCK_API=true
```

这样可以不调用真实 API 进行功能测试。

#### 方案 3: 更换 API Key

1. 在 [OpenAI API Keys](https://platform.openai.com/api-keys) 页面创建新的 API Key
2. 更新 `.dev.vars` 文件：
   ```bash
   OPENAI_API_KEY=sk-your-new-api-key
   ```
3. 重启 Workers 服务

#### 方案 4: 使用其他 AI 服务

可以修改代码接入其他 AI 服务：

**选项 A: 使用 OpenAI 兼容的服务**
```bash
# .dev.vars
OPENAI_BASE_URL=https://api.your-alternative-service.com/v1
OPENAI_API_KEY=your-alternative-api-key
```

推荐服务：
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/cognitive-services/openai-service)
- [DeepSeek](https://platform.deepseek.com/)
- [硅基流动](https://cloud.siliconflow.cn/)

**选项 B: 修改代码接入其他 AI**

可以修改 [src/resolvers.ts](src/resolvers.ts) 接入：
- Anthropic Claude
- Google Gemini
- Cohere
- 其他 AI 服务

### 错误 401: API Key 无效

**错误消息**：
```
Incorrect API key provided
```

**解决方案**：

1. 检查 `.dev.vars` 中的 API Key 是否正确
2. 确保 API Key 以 `sk-` 开头
3. 在 [OpenAI 后台](https://platform.openai.com/api-keys) 验证 Key 是否有效
4. 如果 Key 已失效，创建新的 Key

### 错误 404: 模型不可用

**错误消息**：
```
The model 'xxx' does not exist
```

**解决方案**：

1. 检查模型名称是否正确：
   ```bash
   # .dev.vars
   OPENAI_MODEL=gpt-3.5-turbo  # 或 gpt-4, gpt-4-turbo 等
   ```

2. 确认你的账户有权限访问该模型

3. 使用可用的模型：
   - `gpt-3.5-turbo` (最便宜，速度快)
   - `gpt-4` (更智能，价格高)
   - `gpt-4-turbo` (GPT-4 的快速版本)

### 错误 500: OpenAI 服务器错误

**解决方案**：
- 等待几分钟后重试
- 检查 [OpenAI 状态页面](https://status.openai.com/)

## 本地开发问题

### Workers 启动失败

**问题**: `wrangler dev` 启动失败

**检查清单**：
1. ✅ Node.js 版本是否 >= 18
2. ✅ 是否运行了 `npm install`
3. ✅ `.dev.vars` 文件是否存在
4. ✅ 端口 8787 是否被占用

**解决方案**：
```bash
# 检查端口占用
lsof -i :8787

# 如果被占用，kill 进程或更改端口
# 在 wrangler.jsonc 中添加：
# "dev": { "port": 8788 }
```

### 前端无法连接后端

**问题**: GraphQL 请求失败

**检查清单**：
1. ✅ Workers 服务是否正在运行 (http://localhost:8787)
2. ✅ 浏览器控制台是否有 CORS 错误
3. ✅ Vite 代理配置是否正确

**测试连接**：
```bash
# 测试 Workers 是否可访问
curl http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ hello }"}'
```

### TypeScript 编译错误

**解决方案**：
```bash
# 重新生成类型定义
npm run cf-typegen

# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

## 生产环境问题

### 部署后无法访问

**检查清单**：
1. ✅ 部署是否成功
2. ✅ Secrets 是否配置 (OPENAI_API_KEY)
3. ✅ Workers URL 是否正确

**验证 Secret**：
```bash
# 列出所有 secrets
wrangler secret list

# 如果没有 OPENAI_API_KEY，添加它
wrangler secret put OPENAI_API_KEY
```

### Pages 无法连接 Workers

**检查**：
1. Pages 环境变量 `VITE_WORKERS_URL` 是否配置
2. Workers 的 CORS 设置是否允许 Pages 域名

**临时测试**：
在 [src/index.ts](src/index.ts) 中将 CORS origin 设置为 `*` 进行测试。

## 性能问题

### 响应速度慢

**优化建议**：

1. **使用更快的模型**：
   ```bash
   OPENAI_MODEL=gpt-3.5-turbo  # 最快
   ```

2. **减少 max_tokens**：
   在 [src/resolvers.ts](src/resolvers.ts) 中调整：
   ```typescript
   max_tokens: 500  // 减少到 500
   ```

3. **启用 Smart Placement**：
   在 [wrangler.jsonc](wrangler.jsonc) 中：
   ```json
   "placement": { "mode": "smart" }
   ```

### 对话历史占用内存

**问题**: 长时间运行后内存增长

**解决方案**:
- 当前代码已限制历史为 20 条消息
- 生产环境建议使用 Cloudflare KV 或 Durable Objects 存储历史

## 获取帮助

如果问题仍未解决：

1. 查看 [README.md](README.md) 文档
2. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 查看 [OpenAI API 文档](https://platform.openai.com/docs/)
4. 提交 Issue 到项目仓库

## 常用命令

```bash
# 查看 Workers 日志
wrangler tail

# 测试本地 Workers
curl http://localhost:8787/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ hello }"}'

# 查看环境变量
cat .dev.vars

# 重新生成类型
npm run cf-typegen

# 部署到生产环境
npm run deploy
```
