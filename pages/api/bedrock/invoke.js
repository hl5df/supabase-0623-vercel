import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.BEDROCK_REGION || "us-east-1" });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { prompt } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const model = process.env.BEDROCK_MODEL_ID || "anthropic.claude-haiku-4-5-20251001-v1:0";

  try {
    const isAnthropic = model.startsWith("anthropic.");
    const payload = isAnthropic
      ? { anthropic_version: "bedrock-2023-05-31", max_tokens: 1024, messages: [{ role: "user", content: prompt }] }
      : { max_tokens: 1024, messages: [{ role: "user", content: prompt }] };
    const body = JSON.stringify(payload);

    const command = new InvokeModelCommand({
      modelId: model,
      contentType: "application/json",
      accept: "application/json",
      body,
    });

    const response = await client.send(command);
    const raw = new TextDecoder().decode(response.body);
    const result = JSON.parse(raw);
    const output =
      result.content?.[0]?.text ??
      result.choices?.[0]?.message?.content ??
      result.completion ??
      "";
    if (!output) {
      return res.status(500).json({ error: `Empty response from model ${model}. Raw: ${raw.slice(0, 500)}` });
    }
    const usage = result.usage?.input_tokens != null
      ? result.usage
      : result.usage?.prompt_tokens != null
        ? { input_tokens: result.usage.prompt_tokens, output_tokens: result.usage.completion_tokens }
        : null;
    res.json({ output, model, usage });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
