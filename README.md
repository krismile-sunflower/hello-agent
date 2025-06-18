# 多后端大模型适配说明

本项目支持多种大模型后端，包括 Azure OpenAI、OpenAI 官方、Ollama 本地模型，均通过统一接口调用。

## 主要特性
- 支持流式输出
- 支持函数调用（如 read_file、write_file）
- 支持通过 .env 配置切换后端和模型，新建.env文件，将.env.example 复制为 .env，并修改参数。

## 目录结构
- `src/main.ts`：主入口，自动选择后端并实现对话与函数调用。
- `src/utils/openai.ts`：统一封装多后端 OpenAI 客户端。

## 环境变量配置
`.env` 示例：

```ini
# Azure OpenAI
AZURE_OPENAI_API_KEY='' # 密钥
AZURE_OPENAI_ENDPOINT='' # 总结点
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini # 模型部署名称
AZURE_OPENAI_API_VERSION=2025-01-01-preview # API版本

Azure_MODEL_NAME=gpt-4o-mini-2024-07-18 # 模型名称

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini

# Ollama, 模型需要支持函数调用
OLLAMA_MODEL=qwen3:latest
```

## 切换后端
在 `src/main.ts` 中通过 `getOpenAIClient(OpenAiType.XXX)` 选择后端：
- `OpenAiType.Azure`：Azure OpenAI
- `OpenAiType.OpenAi`：OpenAI 官方
- `OpenAiType.Ollama`：Ollama 本地

## 运行方式
```bash
pnpm install
pnpm run build
pnpm start
```

## 主要代码示例

```typescript
import { getOpenAIClient, OpenAiType } from "./utils/openai";
const { openai, model } = getOpenAIClient(OpenAiType.Ollama); // 可切换
```

## 支持的函数调用
- 读取文件内容：read_file
- 写入文件内容：write_file

## 常见问题
- Ollama 默认监听 http://localhost:11434/v1，需提前启动。
- 各后端模型名称需与本地/云端实际部署一致。


## 文章教程链接
- [掘金](https://juejin.cn/post/7516359841678557238)
---