/**
 * GraphQL Resolvers - 业务逻辑实现
 *
 * 包含所有 GraphQL 查询和变更的实际实现代码
 * 主要功能：
 * - 处理聊天请求
 * - 调用 AI 服务（Groq、DeepSeek 等兼容格式的服务）
 * - 管理对话历史
 * - 错误处理
 *
 * @module resolvers
 */

/**
 * 聊天请求参数接口
 */
interface ChatArgs {
  /** 用户发送的消息内容 */
  message: string;
  /** 对话 ID（可选），用于维护对话上下文 */
  conversationId?: string;
}

/**
 * 聊天响应接口
 */
interface ChatResponse {
  /** AI 生成的回复文本 */
  response: string;
  /** 对话 ID */
  conversationId: string;
  /** 时间戳（毫秒） */
  timestamp: number;
}

/**
 * 对话消息接口
 */
interface ConversationMessage {
  /** 角色：user（用户）或 assistant（AI助手） */
  role: 'user' | 'assistant' | 'system';
  /** 消息内容 */
  content: string;
}

/**
 * AI API 响应接口
 */
interface AIApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * 对话历史存储
 *
 * 使用 Map 存储每个对话的消息历史
 * Key: conversationId（对话ID）
 * Value: 消息数组
 *
 * 注意：
 * - 这是内存存储，Worker 重启后会丢失
 * - 生产环境建议使用 Cloudflare KV 或 Durable Objects
 * - 当前限制每个对话最多保留 20 条消息
 */
const conversationHistory = new Map<string, ConversationMessage[]>();

/**
 * 调用 AI API
 *
 * 使用 fetch 直接调用兼容格式的 AI API（Groq、DeepSeek 等）
 *
 * @param apiKey - API 密钥
 * @param baseURL - API 基础 URL
 * @param model - 模型名称
 * @param messages - 消息历史
 * @returns AI 生成的回复文本
 */
async function callAIApi(
  apiKey: string,
  baseURL: string,
  model: string,
  messages: ConversationMessage[]
): Promise<string> {
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error: any = new Error(`AI API request failed: ${response.status}`);
    error.status = response.status;
    error.statusText = response.statusText;
    throw error;
  }

  const data = (await response.json()) as AIApiResponse;
  return data.choices[0]?.message?.content || '抱歉，我无法生成回复。';
}

/**
 * GraphQL Resolvers 导出对象
 *
 * 包含所有 GraphQL 操作的实现函数
 */
export const resolvers = {
  /**
   * 查询解析器
   */
  Query: {
    /**
     * 健康检查
     *
     * @returns 服务器状态消息
     */
    hello: () => 'Hello from Daily Agent Workers with Groq!',
  },

  /**
   * 变更解析器
   */
  Mutation: {
    /**
     * 处理聊天请求
     *
     * 工作流程：
     * 1. 验证请求参数
     * 2. 检查是否为 Mock 模式
     * 3. 获取/创建对话历史
     * 4. 调用 AI API
     * 5. 返回响应
     * 6. 错误处理
     *
     * @param _parent - GraphQL 父级对象（未使用）
     * @param args - 请求参数
     * @param context - GraphQL 上下文（包含环境变量）
     * @returns AI 回复对象
     */
    chat: async (_parent: unknown, args: ChatArgs, context: { env: Env }): Promise<ChatResponse> => {
      // 解构参数，如果没有提供 conversationId 则生成新的
      const { message, conversationId = `conv_${Date.now()}` } = args;

      // ====================================
      // Mock 模式检查
      // ====================================
      // 用于本地测试，不消耗真实 API 配额
      if (context.env.USE_MOCK_API === 'true') {
        return {
          response: `[Mock 模式] 你说："${message}"。这是一个模拟回复，用于测试。要使用真实的 AI，请设置 USE_MOCK_API=false 并配置有效的 API Key。`,
          conversationId,
          timestamp: Date.now(),
        };
      }

      // ====================================
      // 对话历史管理
      // ====================================
      // 获取或创建对话历史记录
      if (!conversationHistory.has(conversationId)) {
        conversationHistory.set(conversationId, []);
      }
      const history = conversationHistory.get(conversationId)!;

      // 将用户消息添加到历史记录
      // 这样 AI 可以理解对话上下文
      history.push({ role: 'user', content: message });

      try {
        // ====================================
        // 调用 AI API
        // ====================================
        // 构建完整的消息数组（系统提示 + 对话历史）
        const messages: ConversationMessage[] = [
          // 系统提示：定义 AI 的角色和行为
          { role: 'system', content: '你是一个有帮助的 AI 助手。' },
          // 对话历史
          ...history,
        ];

        // 调用 AI API（Groq、DeepSeek 等）
        const responseMessage = await callAIApi(
          context.env.AI_API_KEY,  // API 密钥
          context.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',  // API 基础 URL
          context.env.AI_MODEL || 'llama-3.1-8b-instant',  // 模型名称
          messages
        );

        // ====================================
        // 更新对话历史
        // ====================================
        // 将 AI 的回复添加到历史记录
        history.push({ role: 'assistant', content: responseMessage });

        // 限制历史记录长度，避免上下文过长导致 API 调用失败
        // 保留最近 20 条消息（10 轮对话）
        if (history.length > 20) {
          conversationHistory.set(conversationId, history.slice(-20));
        }

        // 返回成功响应
        return {
          response: responseMessage,
          conversationId,
          timestamp: Date.now(),
        };
      } catch (error: any) {
        // ====================================
        // 错误处理
        // ====================================
        console.error('AI API Error:', error);

        // 移除刚才添加的用户消息（因为请求失败了）
        // 这样下次重试时不会有重复消息
        history.pop();

        // 根据不同的错误类型，生成友好的错误消息
        let errorMessage = '抱歉，AI 服务暂时不可用。';

        // HTTP 429: 配额超限
        if (error?.status === 429) {
          errorMessage = '⚠️ API 配额已用完。请检查你的 API Key 或稍后重试。';
        }
        // HTTP 401: 认证失败
        else if (error?.status === 401) {
          errorMessage = '❌ API Key 无效。请检查 .dev.vars 文件中的 AI_API_KEY 配置。';
        }
        // HTTP 404: 模型不存在
        else if (error?.status === 404) {
          errorMessage = `❌ 模型 "${context.env.AI_MODEL || 'llama-3.1-8b-instant'}" 不可用。请检查模型名称是否正确。`;
        }
        // HTTP 500+: 服务器错误
        else if (error?.status >= 500) {
          errorMessage = '⚠️ AI 服务器出现问题，请稍后重试。';
        }
        // 其他错误
        else if (error?.message) {
          errorMessage = `错误：${error.message}`;
        }

        // 返回错误响应而不是抛出异常
        // 这样前端可以正常显示错误消息，而不会导致整个请求失败
        return {
          response: errorMessage,
          conversationId,
          timestamp: Date.now(),
        };
      }
    },
  },
};
