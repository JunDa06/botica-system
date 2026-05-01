// CARGAR PRODUCTOS
async function cargarProductos() {
  const res = await fetch("http://localhost:3000/productos");
  const data = await res.json();

  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  data.forEach(p => {
    const fila = `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio}</td>
        <td>${p.stock}</td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

// CREAR PRODUCTO
async function crearProducto() {
  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const stock = document.getElementById("stock").value;

  await fetch("http://localhost:3000/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre,
      precio,
      stock
    })
  });

  alert("Producto creado");

  document.getElementById("nombre").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("stock").value = "";

  cargarProductos();
}

// cargar automáticamente al abrir
window.onload = cargarProductos;