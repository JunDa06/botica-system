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

// OBTENER PRODUCTOS (solo activos)
app.get("/productos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE activo = true ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error GET productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// OBTENER PRODUCTOS AGOTADOS
app.get("/productos/agotados", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE activo = false ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error GET agotados:", error);
    res.status(500).json({ error: "Error al obtener productos agotados" });
  }
});

// CREAR PRODUCTO
app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const result = await pool.query(
      "INSERT INTO productos (nombre, precio, stock, activo) VALUES ($1, $2, $3, true) RETURNING *",
      [nombre, precio, stock]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error POST producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// EDITAR PRODUCTO
app.put("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio == null || stock == null) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const result = await pool.query(
      "UPDATE productos SET nombre=$1, precio=$2, stock=$3 WHERE id=$4 RETURNING *",
      [nombre, precio, stock, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error PUT producto:", error);
    res.status(500).json({ error: "Error al editar producto" });
  }
});

// AGOTAR PRODUCTO (🔥 ahora también pone stock = 0)
app.put("/productos/agotar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE productos SET activo = false, stock = 0 WHERE id = $1",
      [id]
    );

    res.json({ mensaje: "Producto agotado" });
  } catch (error) {
    console.error("Error al agotar:", error);
    res.status(500).json({ error: "Error al agotar producto" });
  }
});

// REPONER PRODUCTO (activo=true y stock=1)
app.put("/productos/reponer/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE productos SET activo = true, stock = 1 WHERE id = $1",
      [id]
    );

    res.json({ mensaje: "Producto repuesto" });
  } catch (error) {
    console.error("Error al reponer:", error);
    res.status(500).json({ error: "Error al reponer producto" });
  }
});

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});