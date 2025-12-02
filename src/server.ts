import express from "express";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static assets (css, js if any)
const pagesDir = path.join(process.cwd(), "src", "pages");
const publicDir = path.join(process.cwd(), "src", "public");
app.use("/static", express.static(publicDir));

// Database (SQLite)
const dbPath = path.join(process.cwd(), "data", "ecotrack.db");
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      potencia REAL,
      horasUso REAL
    )`
  );
});

// Helper to run SQL with Promise
function runAsync(sql: string, params: any[] = []) {
  return new Promise<number>((resolve, reject) => {
    db.run(sql, params, function (this: any, err: Error | null) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}
function allAsync<T>(sql: string, params: any[] = []) {
  return new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

// API endpoints
app.get("/api/devices", async (req, res) => {
  try {
    const rows = await allAsync<any>("SELECT * FROM devices ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar dispositivos" });
  }
});

app.post("/api/devices", async (req, res) => {
  try {
    const { nome, potencia, horasUso } = req.body;
    if (!nome || isNaN(potencia) || isNaN(horasUso)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }
    const id = await runAsync("INSERT INTO devices (nome, potencia, horasUso) VALUES (?, ?, ?)", [nome, potencia, horasUso]);
    res.json({ id, nome, potencia, horasUso });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar dispositivo" });
  }
});

app.delete("/api/devices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await runAsync("DELETE FROM devices WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar dispositivo" });
  }
});

// Calculate house consumption: can use stored devices or devices passed in body
app.post("/api/calculate-house", async (req, res) => {
  // expected body: { devices?: [{nome,potencia,horasUso}], tarifa?: number }
  try {
    let devices = req.body.devices;
    const tarifa = Number(req.body.tarifa ?? 0.8); // price per kWh (currency unit) default 0.8
    if (!devices) {
      devices = await allAsync<any>("SELECT * FROM devices");
    }
    // total daily kWh = sum(potencia watts * horasUso)/1000
    const totalDailyKwh = devices.reduce((sum: number, d: any) => sum + (d.potencia * d.horasUso) / 1000, 0);
    const totalMonthlyKwh = totalDailyKwh * 30;
    const dailyCost = totalDailyKwh * tarifa;
    const monthlyCost = totalMonthlyKwh * tarifa;
    res.json({
      totalDailyKwh,
      totalMonthlyKwh,
      dailyCost,
      monthlyCost,
      devicesCount: devices.length
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao calcular consumo da casa" });
  }
});

// Fazenda (bitcoin mining) calculation
app.post("/api/fazenda", (req, res) => {
  // expected body: { numeroRigs, potenciaPorRig, horasPorDia, tarifa }
  try {
    const numeroRigs = Number(req.body.numeroRigs);
    const potenciaPorRig = Number(req.body.potenciaPorRig); // watts
    const horasPorDia = Number(req.body.horasPorDia);
    const tarifa = Number(req.body.tarifa ?? 0.8);

    if ([numeroRigs, potenciaPorRig, horasPorDia].some(x => isNaN(x))) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const consumoDiarioKwh = (numeroRigs * potenciaPorRig * horasPorDia) / 1000;
    const consumoMensalKwh = consumoDiarioKwh * 30;
    const custoDiario = consumoDiarioKwh * tarifa;
    const custoMensal = consumoMensalKwh * tarifa;

    res.json({
      consumoDiarioKwh,
      consumoMensalKwh,
      custoDiario,
      custoMensal,
      numeroRigs,
      potenciaPorRig,
      horasPorDia
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao calcular fazenda" });
  }
});

// Serve pages
app.get("/", (req, res) => {
  res.sendFile(path.join(pagesDir, "index.html"));
});
app.get("/cadastro", (req, res) => {
  res.sendFile(path.join(pagesDir, "cadastro.html"));
});
app.get("/dispositivos", (req, res) => {
  res.sendFile(path.join(pagesDir, "dispositivos.html"));
});
app.get("/calculadora-casa", (req, res) => {
  res.sendFile(path.join(pagesDir, "calculadora-casa.html"));
});
app.get("/fazenda-bitcoin", (req, res) => {
  res.sendFile(path.join(pagesDir, "fazenda-bitcoin.html"));
});

// Start
const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Servidor EcoTrack em http://localhost:${port}`);
});
