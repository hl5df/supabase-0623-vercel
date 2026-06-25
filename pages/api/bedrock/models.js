import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";

const client = new BedrockClient({ region: process.env.BEDROCK_REGION });

export default async function handler(req, res) {
  try {
    const data = await client.send(new ListFoundationModelsCommand({}));
    const models = (data.modelSummaries || [])
      .filter((m) => m.modelLifecycle?.status === "ACTIVE")
      .map((m) => ({ id: m.modelId, name: m.modelName, provider: m.providerName }))
      .sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name));
    res.json({ models });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
