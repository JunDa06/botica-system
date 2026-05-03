const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Pool } = require("pg");

// 🔐
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// 🔐 SECRET
const SECRET = "mi_clave_secreta";

// conexión a Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==========================
// 🧪 PRUEBA
// ==========================
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// ==========================
// 🔐 LOGIN
// ==========================
app.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    const user = result.rows[0];

    const valido = await bcrypt.compare(password, user.password);

    if (!valido) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario },
      SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });

  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ error: "Error en login" });
  }
});

app.post("/crear-usuario", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Campos incompletos" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuarios (usuario, password) VALUES ($1, $2)",
      [usuario, hash]
    );

    res.json({ mensaje: "Usuario creado" });

  } catch (error) {
    console.error("Error crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// ==========================
// 📦 PRODUCTOS
// ==========================
app.get("/productos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE activo = true ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.get("/productos/agotados", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM productos WHERE activo = false ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener agotados" });
  }
});

app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;

    const result = await pool.query(
      "INSERT INTO productos (nombre, precio, stock, activo) VALUES ($1, $2, $3, true) RETURNING *",
      [nombre, precio, stock]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    const result = await pool.query(
      "UPDATE productos SET nombre=$1, precio=$2, stock=$3 WHERE id=$4 RETURNING *",
      [nombre, precio, stock, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al editar producto" });
  }
});

app.put("/productos/agotar/:id", async (req, res) => {
  await pool.query(
    "UPDATE productos SET activo=false, stock=0 WHERE id=$1",
    [req.params.id]
  );
  res.json({ mensaje: "Agotado" });
});

app.put("/productos/reponer/:id", async (req, res) => {
  await pool.query(
    "UPDATE productos SET activo=true, stock=1 WHERE id=$1",
    [req.params.id]
  );
  res.json({ mensaje: "Repuesto" });
});

// ==========================
// 🧾 VENTAS 
// ==========================
app.post("/ventas", async (req, res) => {
  const client = await pool.connect();

  try {
    const { productos, cliente } = req.body;

    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "No hay productos" });
    }

    await client.query("BEGIN");

    let total = 0;
    productos.forEach(p => {
      total += p.precio * p.cantidad;
    });

    // 🧾 crear boleta
    const boletaResult = await client.query(
      "INSERT INTO boletas (total, cliente) VALUES ($1, $2) RETURNING id",
      [total, cliente || null]
    );

    const boletaId = boletaResult.rows[0].id;

    // 📦 procesar productos
    for (const p of productos) {
      const r = await client.query(
        "SELECT stock, nombre FROM productos WHERE id=$1",
        [p.id]
      );

      if (r.rows.length === 0) {
        throw new Error("Producto no existe");
      }

      const stockActual = r.rows[0].stock;
      const nombre = r.rows[0].nombre;

      if (p.cantidad > stockActual) {
        throw new Error(`Stock insuficiente: ${nombre}`);
      }

      // 📉 descontar stock
      await client.query(
        "UPDATE productos SET stock = stock - $1 WHERE id = $2",
        [p.cantidad, p.id]
      );

      // 🔥 SI LLEGA A 0 → MARCAR COMO AGOTADO
      await client.query(
        "UPDATE productos SET activo = false WHERE id = $1 AND stock <= 0",
        [p.id]
      );

      // 📦 guardar detalle
      await client.query(
        "INSERT INTO detalle_boleta (boleta_id, producto_id, cantidad, precio) VALUES ($1,$2,$3,$4)",
        [boletaId, p.id, p.cantidad, p.precio]
      );
    }

    await client.query("COMMIT");

    res.json({ mensaje: "Venta registrada correctamente" });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en venta:", error.message);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ==========================
// 📊 HISTORIAL
// ==========================

// 🧾 todas las boletas
app.get("/boletas", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM boletas ORDER BY fecha DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener boletas" });
  }
});

// 📦 detalle por boleta
app.get("/boletas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT p.nombre, d.cantidad, d.precio
      FROM detalle_boleta d
      JOIN productos p ON d.producto_id = p.id
      WHERE d.boleta_id = $1
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener detalle" });
  }
});

// ==========================
app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});