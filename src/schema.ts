/**
 * GraphQL Schema 定义
 *
 * 定义了 API 的类型系统，包括：
 * - Query: 只读查询操作
 * - Mutation: 数据修改操作
 * - 自定义类型: 返回值结构
 *
 * @module schema
 */

/**
 * GraphQL 类型定义字符串
 *
 * 使用 GraphQL Schema Definition Language (SDL) 定义 API 结构
 */
export const typeDefs = /* GraphQL */ `
  """
  查询类型 - 用于读取数据
  """
  type Query {
    """
    健康检查端点
    返回服务器状态信息
    用于测试 GraphQL 服务是否正常运行
    """
    hello: String!
  }

  """
  变更类型 - 用于修改数据或触发操作
  """
  type Mutation {
    """
    发送聊天消息并获取 AI 回复

    参数:
      - message: 用户发送的消息内容（必需）
      - conversationId: 对话 ID，用于维护上下文（可选）
                        如果不提供，系统会自动生成新的 ID

    返回:
      - ChatResponse: 包含 AI 回复和对话信息

    示例:
      mutation {
        chat(message: "你好", conversationId: "conv_123") {
          response
          conversationId
          timestamp
        }
      }
    """
    chat(message: String!, conversationId: String): ChatResponse!
  }

  """
  聊天响应类型
  包含 AI 的回复内容和相关元数据
  """
  type ChatResponse {
    """
    AI 生成的回复文本
    """
    response: String!

    """
    对话 ID
    用于在多轮对话中保持上下文连贯性
    """
    conversationId: String!

    """
    时间戳（Unix 毫秒）
    记录回复生成的时间
    """
    timestamp: Float!
  }
`;
