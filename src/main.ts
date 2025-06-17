import dotenv from "dotenv";
import readline from "readline";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { readFileSync, writeFileSync } from "fs";
import { getOpenAIClient, OpenAiType } from "./utils/openai";

dotenv.config();

// const openai = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
const {openai, model} = getOpenAIClient(OpenAiType.Ollama);
function readFile(args: any) {
  try {
    const content = readFileSync(args.path, "utf-8");
    return content;
  } catch (e) {
    return `读取文件失败: ${e}`;
  }
}
async function writeFile(args: { fName: string; content: string }) {
  try {
    writeFileSync(args.fName, args.content, "utf-8");
    return `已将内容写入文件：${args.fName}`;
  } catch (e) {
    return `读取或写入文件失败: ${e}`;
  }
}
async function chatLoop() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "用中文回答问题。",
    },
  ];
  async function getChatResponseWithStream(
    message: ChatCompletionMessageParam[]
  ): Promise<void> {
    const stream = await openai.chat.completions.create({
      model: model,
      messages: message,
      stream: true,
    });
    let msg = "";
    process.stdout.write("AI: ");
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        process.stdout.write(content);
        msg += content;
      }
    }
    messages.push({ role: "assistant", content: msg });
    process.stdout.write("\n");
  }
  async function ask() {
    rl.question("You: ", async (input) => {
      messages.push({ role: "user", content: input });
      const stream = await openai.chat.completions.create({
        model: model,
        messages: messages,
        tools: [
          {
            type: "function",
            function: {
              name: "read_file",
              description: "读取指定文件内容",
              parameters: {
                type: "object",
                properties: {
                  path: {
                    type: "string",
                    description: "要读取的文件路径",
                  },
                },
                required: ["path"],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "write_file",
              description: "将内容输入到文件中",
              parameters: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    description: "需要写入的文件内容",
                  },
                  fName: {
                    type: "string",
                    description: "要写入的文件名",
                  },
                },
                required: ["content", "fName"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });
      const content = stream.choices?.[0]?.message?.content;
      const functionCall = stream.choices?.[0]?.message?.tool_calls;
      if (functionCall && functionCall.length > 0) {
        for (const fnCall of functionCall) {
          messages.push(stream.choices?.[0]?.message); // 插入 tool_calls 消息
          const fnName = fnCall.function.name;
          if (fnName === "read_file") {
            const args = JSON.parse(fnCall.function.arguments || "{}");
            const result = readFile(args);
            messages.push({
              role: "tool",
              tool_call_id: fnCall.id,
              content: result,
            });
          }
          if (fnName === "write_file") {
            const args = JSON.parse(fnCall.function.arguments || "{}");
            const result = await writeFile(args);
            messages.push({
              role: "tool",
              tool_call_id: fnCall.id,
              content: result,
            });
          }
          process.stdout.write(`\n[函数调用了工具]: ${fnCall.function.name}\n`);
        }
        await getChatResponseWithStream(messages);
      } else if (content) {
        // 没有 tool_calls，直接插入 assistant 消消息
        process.stdout.write("\nAI: ");
        process.stdout.write(content + "\n");
        messages.push({ role: "assistant", content });
      }
      ask();
    });
  }
  ask();
}
chatLoop();