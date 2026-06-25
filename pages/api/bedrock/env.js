export default function handler(req, res) {
  res.json({
    bindings: {
      BEDROCK_REGION: process.env.BEDROCK_REGION ?? null,
    },
  });
}
