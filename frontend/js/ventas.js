// 🔥 LISTAS
let productos = [];
let carrito = [];

// CARGAR PRODUCTOS
async function cargarProductos() {
  const res = await fetch("http://localhost:3000/productos");
  productos = await res.json();

  mostrarProductos();
}

// MOSTRAR PRODUCTOS
function mostrarProductos() {
  const tabla = document.getElementById("listaProductos");
  tabla.innerHTML = "";

  productos.forEach(p => {
    const fila = `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio}</td>
        <td>
          <button onclick="agregarAlCarrito(${p.id})">➕</button>
        </td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

// AGREGAR AL CARRITO
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const existente = carrito.find(p => p.id === id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1
    });
  }

  mostrarCarrito();
}

// MOSTRAR CARRITO
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

// CAMBIAR CANTIDAD
function cambiarCantidad(id, cambio) {
  const producto = carrito.find(p => p.id === id);
  if (!producto) return;

  producto.cantidad += cambio;

  if (producto.cantidad <= 0) {
    carrito = carrito.filter(p => p.id !== id);
  }

  mostrarCarrito();
}

// ELIMINAR PRODUCTO
function eliminarDelCarrito(id) {
  carrito = carrito.filter(p => p.id !== id);
  mostrarCarrito();
}

// 🧾 GENERAR BOLETA PDF (PRO)
function generarBoleta() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  // 🔥 pedir cliente
  const cliente = prompt("Ingrese el nombre del cliente:");
  if (!cliente) {
    alert("Debe ingresar un nombre");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let y = 10;

  // 🏪 ENCABEZADO
  doc.setFontSize(16);
  doc.text("BOTICA SALUD TOTAL", 10, y);

  y += 8;
  doc.setFontSize(10);
  doc.text("RUC: 123456789", 10, y);

  y += 5;
  doc.text("Dirección: Huacachina - Ica", 10, y);

  y += 8;

  // 📅 FECHA Y CLIENTE
  const fecha = new Date().toLocaleString();
  doc.text(`Fecha: ${fecha}`, 10, y);

  y += 5;
  doc.text(`Cliente: ${cliente}`, 10, y);

  y += 10;

  // 📦 DETALLE
  doc.setFontSize(12);
  doc.text("DETALLE DE COMPRA", 10, y);

  y += 6;

  carrito.forEach(p => {
    const linea = `${p.nombre} x${p.cantidad}   S/ ${(p.precio * p.cantidad).toFixed(2)}`;
    doc.text(linea, 10, y);
    y += 6;
  });

  // 💰 TOTAL
  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  y += 10;
  doc.setFontSize(13);
  doc.text(`TOTAL: S/ ${total.toFixed(2)}`, 10, y);

  // 🙏 MENSAJE FINAL
  y += 10;
  doc.setFontSize(10);
  doc.text("Gracias por su compra 🙌", 10, y);
  doc.text("Vuelva pronto 😊", 10, y + 5);

  // 📄 GUARDAR
  doc.save("boleta.pdf");
}

// cargar al abrir
window.onload = cargarProductos;