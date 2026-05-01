const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// conexión a Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// OBTENER PRODUCTOS
app.get("/productos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM productos ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    console.error("Error GET productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// CREAR PRODUCTO
app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    // Validación básica
    if (!nombre || !precio || !stock) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const result = await pool.query(
      "INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *",
      [nombre, precio, stock]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error POST producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});