export default function handler(req, res) {
  res.json({
    bindings: {
      PGHOST: process.env.PGHOST ?? null,
      PGUSER: process.env.PGUSER ?? null,
      PGPORT: process.env.PGPORT ?? null,
      PGDATABASE: process.env.PGDATABASE ?? null,
      PGSSLMODE: process.env.PGSSLMODE ?? null,
    },
  });
}
