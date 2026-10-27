const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stats (
      id SERIAL PRIMARY KEY,
      server TEXT NOT NULL,
      cpu_percent REAL NOT NULL,
      memory_percent REAL NOT NULL,
      disk_percent REAL NOT NULL,
      reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "db not reachable" });
  }
});

app.post("/stats", async (req, res) => {
  const { server, cpu_percent, memory_percent, disk_percent } = req.body;
  if (!server || cpu_percent == null || memory_percent == null || disk_percent == null) {
    return res.status(400).json({ error: "missing fields" });
  }
  await pool.query(
    "INSERT INTO stats (server, cpu_percent, memory_percent, disk_percent) VALUES ($1, $2, $3, $4)",
    [server, cpu_percent, memory_percent, disk_percent]
  );
  res.status(201).json({ saved: true });
});

app.get("/servers", async (req, res) => {
  const result = await pool.query(`
    SELECT DISTINCT ON (server) server, cpu_percent, memory_percent, disk_percent, reported_at
    FROM stats
    ORDER BY server, reported_at DESC
  `);
  res.json(result.rows);
});

initDb()
  .then(() => app.listen(3000, () => console.log("API listening on port 3000")))
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
