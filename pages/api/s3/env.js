export default function handler(req, res) {
  const bindings = {
    BUCKET_NAME: process.env.BUCKET_NAME ?? null,
    BUCKET_REGION: process.env.BUCKET_REGION ?? null,
    PGHOST: process.env.PGHOST ?? null,
    PGUSER: process.env.PGUSER ?? null,
    PGPORT: process.env.PGPORT ?? null,
    PGDATABASE: process.env.PGDATABASE ?? null,
    PGSSLMODE: process.env.PGSSLMODE ?? null,
    DSQL_ADMIN_USER: process.env.DSQL_ADMIN_USER ?? null,
    DSQL_REGION: process.env.DSQL_REGION ?? null,
    BEDROCK_REGION: process.env.BEDROCK_REGION ?? null,
    BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID ?? null,
  };

  const custom = {};
  const skip = new Set([...Object.keys(bindings), "PATH", "HOME", "NODE_ENV", "NODE_PATH", "HOSTNAME", "PWD", "LANG", "TERM", "SHELL", "USER", "LOGNAME", "SHLVL", "_", "NEXT_RUNTIME", "PORT", "__NEXT_PRIVATE_STANDALONE_CONFIG"]);
  for (const [k, v] of Object.entries(process.env)) {
    if (!skip.has(k) && !k.startsWith("__") && !k.startsWith("npm_") && !k.startsWith("NEXT_")) {
      custom[k] = /secret|key|token|password/i.test(k) ? "••••••••" : v;
    }
  }

  res.json({ bindings, custom });
}
