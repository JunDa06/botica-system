let productos = [];
let carrito = [];

// ==========================
// 📦 CARGAR PRODUCTOS
// ==========================
async function cargarProductos() {
  const res = await fetch("http://localhost:3000/productos");
  productos = await res.json();

  mostrarProductos(productos);
}

// ==========================
// 🔍 MOSTRAR PRODUCTOS
// ==========================
function mostrarProductos(lista = productos) {
  const tabla = document.getElementById("listaProductos");
  tabla.innerHTML = "";

  lista.forEach(p => {
    const fila = `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio}</td>
        <td>${p.stock}</td>
        <td>
          <button 
            onclick="agregarAlCarrito(${p.id})"
            ${p.stock === 0 ? "disabled" : ""}
          >
            ➕
          </button>
        </td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

// ==========================
// 🔍 BUSCADOR
// ==========================
function filtrarVentas() {
  const texto = document.getElementById("buscadorVentas").value.toLowerCase();

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  mostrarProductos(filtrados);
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(p => p.id === id);

  if (producto.stock === 0) {
    alert("Sin stock");
    return;
  }

  if (existente) {
    if (existente.cantidad >= producto.stock) {
      alert("No hay más stock disponible");
      return;
    }
    existente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }

  mostrarCarrito();
}


function mostrarCarrito() {
  const tabla = document.getElementById("carrito");
  tabla.innerHTML = "";

  let total = 0;

  carrito.forEach(p => {
    const subtotal = p.precio * p.cantidad;
    total += subtotal;

    const fila = `
      <tr>
        <td>${p.nombre}</td>
        <td>
          <button onclick="cambiarCantidad(${p.id}, -1)">➖</button>
          ${p.cantidad}
          <button onclick="cambiarCantidad(${p.id}, 1)">➕</button>
        </td>
        <td>S/ ${subtotal.toFixed(2)}</td>
        <td>
          <button onclick="eliminarDelCarrito(${p.id})">❌</button>
        </td>
      </tr>
    `;

    tabla.innerHTML += fila;
  });

  document.getElementById("total").innerText = total.toFixed(2);
}

function cambiarCantidad(id, cambio) {
  const producto = carrito.find(p => p.id === id);
  const original = productos.find(p => p.id === id);

  if (!producto) return;

  const nuevaCantidad = producto.cantidad + cambio;

  if (nuevaCantidad <= 0) {
    carrito = carrito.filter(p => p.id !== id);
  } else if (nuevaCantidad > original.stock) {
    alert("Stock insuficiente");
    return;
  } else {
    producto.cantidad = nuevaCantidad;
  }

  mostrarCarrito();
}

// ==========================
// ❌ ELIMINAR
// ==========================
function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  mostrarCarrito();
}

// ==========================
// 🧾 GENERAR BOLETA 
// ==========================
async function generarBoleta() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const cliente = prompt("Ingrese el nombre del cliente:");
  if (!cliente) {
    alert("Debe ingresar un nombre");
    return;
  }

  // 🔥 ENVIAR AL BACKEND (YA CON CLIENTE)
  const res = await fetch("http://localhost:3000/ventas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      productos: carrito,
      cliente: cliente
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  // ==========================
  // 📄 GENERAR PDF
  // ==========================
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  doc.setFontSize(16);
  doc.text("BOTICA SALUD TOTAL", 10, y);

  y += 8;
  doc.setFontSize(10);
  doc.text("RUC: 123456789", 10, y);

  y += 5;
  doc.text("Dirección: Huacachina - Ica", 10, y);

  y += 8;

  const fecha = new Date().toLocaleString();
  doc.text(`Fecha: ${fecha}`, 10, y);

  y += 5;
  doc.text(`Cliente: ${cliente}`, 10, y);

  y += 10;

  doc.setFontSize(12);
  doc.text("DETALLE DE COMPRA", 10, y);

  y += 6;

  carrito.forEach(p => {
    const linea = `${p.nombre} x${p.cantidad}   S/ ${(p.precio * p.cantidad).toFixed(2)}`;
    doc.text(linea, 10, y);
    y += 6;
  });

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  y += 10;
  doc.setFontSize(13);
  doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 10, y);

  y += 10;
  doc.setFontSize(10);
  doc.text("Gracias por su compra ", 10, y);
  doc.text("Vuelva pronto ", 10, y + 5);

  doc.save("boleta.pdf");

  // 🔄 LIMPIAR Y ACTUALIZAR
  carrito = [];
  mostrarCarrito();
  cargarProductos();

  alert("Venta realizada correctamente");
}

window.onload = cargarProductos;