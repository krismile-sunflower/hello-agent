``` tsx
async function getChatResponseWithStream(prompt: string): Promise<void> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini-2024-07-18",
    messages: [{ role: "system", content: '用中文回答' }, { role: "user", content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
}
```