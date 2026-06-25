import { DsqlSigner } from "@aws-sdk/dsql-signer";
import postgres from "postgres";

function getRegionFromHost(host) {
  const match = host?.match(/\.dsql\.(.+?)\.on\.aws/);
  return match ? match[1] : "us-east-1";
}

export default async function handler(req, res) {
  const host = process.env.PGHOST;
  const region = getRegionFromHost(host);

  let connection;
  try {
    const signer = new DsqlSigner({ hostname: host, region });
    const token = await signer.getDbConnectAuthToken();

    connection = postgres({
      host,
      port: parseInt(process.env.PGPORT || "5432"),
      username: process.env.PGUSER || "admin",
      password: token,
      database: process.env.PGDATABASE || "postgres",
      ssl: true,
    });

    const rows = await connection`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    res.json({ tables: rows.map((r) => r.table_name) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
}
