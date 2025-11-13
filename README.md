# Daily Agent Workers

基于 Cloudflare Workers 的 GraphQL API 服务，为 Daily Agent Pages 提供 AI 聊天后端。

## 功能特性

- ✅ GraphQL API 接口
- ✅ 集成 OpenAI API
- ✅ 对话历史管理
- ✅ CORS 支持
- ✅ 本地开发支持

## 技术栈

- **Runtime**: Cloudflare Workers
- **GraphQL**: graphql-yoga
- **AI**: OpenAI API
- **Language**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.dev.vars` 文件，添加你的 OpenAI API Key：

```bash
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_BASE_URL=https://api.openai.com/v1
```

### 3. 本地开发

```bash
npm run dev
```

服务将启动在 `http://localhost:8787`

### 4. 测试 GraphQL API

访问 `http://localhost:8787/graphql` 测试 API

示例查询：

```graphql
query {
  hello
}
```

示例 Mutation：

```graphql
mutation {
  chat(message: "你好", conversationId: "test-123") {
    response
    conversationId
    timestamp
  }
}
```

## 部署

### 1. 设置生产环境 Secret

```bash
wrangler secret put OPENAI_API_KEY
```

输入你的 OpenAI API Key。

### 2. 部署到 Cloudflare Workers

```bash
npm run deploy
```

## GraphQL Schema

```graphql
type Query {
  hello: String!
}

type Mutation {
  chat(message: String!, conversationId: String): ChatResponse!
}

type ChatResponse {
  response: String!
  conversationId: String!
  timestamp: Float!
}
```

## 项目结构

```
daily-agent-workers/
├── src/
│   ├── index.ts       # Worker 入口
│   ├── schema.ts      # GraphQL Schema
│   └── resolvers.ts   # GraphQL Resolvers
├── wrangler.jsonc     # Wrangler 配置
├── .dev.vars          # 本地环境变量
└── package.json
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API Key (必需) | - |
| `OPENAI_MODEL` | OpenAI 模型 | gpt-3.5-turbo |
| `OPENAI_BASE_URL` | OpenAI API 基础 URL | https://api.openai.com/v1 |

## 注意事项

1. `.dev.vars` 文件包含敏感信息，不要提交到 Git
2. 对话历史目前存储在内存中，生产环境建议使用 Cloudflare KV 或 Durable Objects
3. 确保 CORS 配置适合你的生产环境需求

## Mock 模式

用于测试功能而不消耗 API 配额：

```bash
# 在 .dev.vars 中设置
USE_MOCK_API=true
```

启用后，API 将返回模拟响应，不会调用 OpenAI。

## 故障排查

遇到问题？查看 [故障排查指南](TROUBLESHOOTING.md)：

- ✅ OpenAI API 配额超限 (429 错误)
- ✅ API Key 无效 (401 错误)
- ✅ 模型不可用 (404 错误)
- ✅ 连接问题
- ✅ 部署问题

## License

MIT
