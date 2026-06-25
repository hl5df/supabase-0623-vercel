import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import postgres from "postgres";

function getRegionFromHost(host) {
  const match = host?.match(/\.dsql\.(.+?)\.on\.aws/);
  return match ? match[1] : "us-east-1";
}

export default async function handler(req, res) {
  const host = process.env.PGHOST;
  const region = getRegionFromHost(host);

  const info = {
    PGHOST: host,
    PGUSER: process.env.PGUSER,
    PGPORT: process.env.PGPORT,
    PGDATABASE: process.env.PGDATABASE,
    PGSSLMODE: process.env.PGSSLMODE,
    derivedRegion: region,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSessionToken: !!process.env.AWS_SESSION_TOKEN,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  };

  try {
    const sts = new STSClient({ region });
    const identity = await sts.send(new GetCallerIdentityCommand({}));
    info.callerArn = identity.Arn;
    info.account = identity.Account;
  } catch (e) {
    info.stsError = e.message;
  }

  let connection;
  try {
    const signer = new DsqlSigner({ hostname: host, region });
    const token = await signer.getDbConnectAdminAuthToken();
    info.tokenGenerated = true;
    info.tokenPrefix = token.substring(0, 80) + "...";

    info.tokenLength = token.length;

    connection = postgres({
      host,
      port: 5432,
      username: process.env.PGUSER || "admin",
      password: token,
      database: "postgres",
      ssl: true,
    });

    const rows = await connection`SELECT 1 as connected`;
    info.connectionTest = "SUCCESS";
    info.testResult = rows;
  } catch (e) {
    info.connectionTest = "FAILED";
    info.connectionError = e.message;
    info.connectionErrorCode = e.code;
  } finally {
    if (connection) await connection.end().catch(() => {});
  }

  // Also try non-admin token
  let connection2;
  try {
    const signer2 = new DsqlSigner({ hostname: host, region });
    const token2 = await signer2.getDbConnectAuthToken();
    info.nonAdminTokenLength = token2.length;

    connection2 = postgres({
      host,
      port: 5432,
      username: process.env.PGUSER || "admin",
      password: token2,
      database: "postgres",
      ssl: true,
    });

    const rows2 = await connection2`SELECT 1 as connected`;
    info.nonAdminConnectionTest = "SUCCESS";
  } catch (e) {
    info.nonAdminConnectionTest = "FAILED";
    info.nonAdminConnectionError = e.message;
  } finally {
    if (connection2) await connection2.end().catch(() => {});
  }

  res.json(info);
}
