/**
 * Daily Agent Workers - GraphQL API 服务
 *
 * 功能：
 * - 提供 GraphQL API 接口
 * - 支持多种 AI 服务（Groq、DeepSeek 等兼容 OpenAI 格式的服务）
 * - 管理对话历史
 * - 处理 CORS 跨域请求
 *
 * 端点：
 * - POST /graphql - GraphQL API 主入口
 * - GET  /graphql - 用于测试（不推荐生产环境）
 *
 * 环境变量（在 .dev.vars 或 Cloudflare Dashboard 配置）：
 * - AI_API_KEY: AI 服务的 API Key（必需）
 * - AI_MODEL: 使用的模型名称（可选，默认 llama-3.1-8b-instant）
 * - AI_BASE_URL: API 基础 URL（可选，默认 Groq API）
 * - USE_MOCK_API: 是否使用 Mock 模式（可选，默认 false）
 *
 * @author Daily Agent Team
 * @version 2.0.0
 */

import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

/**
 * Cloudflare Workers 入口点
 *
 * @param request - HTTP 请求对象
 * @param env - 环境变量和绑定
 * @param ctx - 执行上下文
 * @returns HTTP 响应
 */
export default {
	async fetch(request, env, ctx): Promise<Response> {
		// 创建 GraphQL Schema
		// 将类型定义和解析器组合成完整的 GraphQL schema
		const schema = createSchema({
			typeDefs,   // GraphQL 类型定义（查询、变更、类型）
			resolvers,  // 字段解析函数（实际的业务逻辑）
		});

		// 创建 GraphQL Yoga 服务器实例
		// Yoga 是一个轻量级、高性能的 GraphQL 服务器
		const yoga = createYoga({
			schema,
			// 将环境变量注入到 GraphQL 上下文中
			// 这样 resolvers 就可以访问 API keys 等配置
			context: { env },

			// CORS 配置 - 允许前端跨域访问
			cors: {
				origin: '*',  // 允许所有域名访问（生产环境建议限制为具体域名）
				credentials: true,  // 允许携带认证信息
				allowedHeaders: ['Content-Type', 'Authorization'],  // 允许的请求头
				methods: ['GET', 'POST', 'OPTIONS'],  // 允许的 HTTP 方法
			},

			// GraphQL 端点路径
			// 访问 https://your-worker.workers.dev/graphql
			graphqlEndpoint: '/graphql',

			// 禁用 GraphiQL 开发工具界面
			// 生产环境建议禁用，开发时可以设为 true
			landingPage: false,
		});

		// 处理 HTTP 请求并返回响应
		// Yoga 会自动处理 GraphQL 查询解析、验证和执行
		return yoga.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
