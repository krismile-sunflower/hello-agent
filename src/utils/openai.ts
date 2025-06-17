import dotenv from "dotenv";
import OpenAI, { AzureOpenAI } from "openai";

export enum OpenAiType {
  Azure = "azure",
  Ollama = "ollama",
  OpenAi = "openai",
}

dotenv.config();

type Result = {
  openai: OpenAI;
  model: string;
};
function getOpenAIClient(type: OpenAiType): Result {
  switch (type) {
    case OpenAiType.Azure:
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

      return {
        openai: new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment }),
        model: process.env.Azure_MODEL_NAME || "gpt-4o-mini-2024-07-18",
      };
    case OpenAiType.Ollama:
      return {
        openai: new OpenAI({
          baseURL: "http://localhost:11434/v1",
          apiKey: "",
        }),
        model: process.env.OLLAMA_MODEL || "qwen3:latest",
      };
    case OpenAiType.OpenAi:
      return {
        openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" }),
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      };
    default:
      return {
        openai: new OpenAI({
          baseURL: "http://localhost:11434/v1",
          apiKey: "",
        }),
        model: process.env.OLLAMA_MODEL || "qwen3:latest",
      };
  }
}

export { getOpenAIClient };
