// 🔥 LISTA GLOBAL PARA BUSCADOR
let productos = [];

// CARGAR PRODUCTOS
async function cargarProductos() {
  const res = await fetch("http://localhost:3000/productos");
  productos = await res.json();

  mostrarProductos(productos);
}

// MOSTRAR PRODUCTOS
function mostrarProductos(lista) {
  const tabla = document.getElementById("tablaProductos");
  tabla.innerHTML = "";

  lista.forEach(p => {
    const fila = `
      <tr style="${p.stock <= 5 ? 'background:#fff0f0;' : ''}">
        <td>
          <input id="nombre-${p.id}" value="${p.nombre}" disabled>
        </td>
        <td>
          <input id="precio-${p.id}" value="${p.precio}" disabled>
        </td>
        <td style="${p.stock <= 5 ? 'background:#ffe6e6;' : ''}">
          <input id="stock-${p.id}" value="${p.stock}" disabled>
          ${p.stock <= 5 ? '<span style="color:red; font-weight:bold; margin-left:6px;">⚠️ Bajo stock</span>' : ''}
        </td>
        <td>
          <button id="btnEditar-${p.id}" onclick="activarEdicion(${p.id})">Editar</button>
          <button id="btnGuardar-${p.id}" onclick="guardarCambios(${p.id})" style="display:none;">Guardar</button>
          <button id="btnCancelar-${p.id}" onclick="cancelarEdicion(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock})" style="display:none;">Cancelar</button>
          <button id="btnAgotar-${p.id}" onclick="agotarProducto(${p.id})">Agotar</button>
        </td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

// 🔍 FILTRAR PRODUCTOS
function filtrarProductos() {
  const texto = document.getElementById("buscador").value.toLowerCase();

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  mostrarProductos(filtrados);
}

// CREAR PRODUCTO
async function crearProducto() {
  const nombre = document.getElementById("nombre").value;
  const precio = document.getElementById("precio").value;
  const stock = document.getElementById("stock").value;

  if (!nombre || !precio || !stock) {
    alert("Completa todos los campos");
    return;
  }

  const res = await fetch("http://localhost:3000/productos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nombre, precio, stock })
  });

  if (res.ok) {
    alert("Producto creado");

    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";

    cargarProductos();
  } else {
    alert("Error al crear producto");
  }
}

// EDITAR PRODUCTO
async function editarProducto(id, nombre, precio, stock) {
  await fetch(`http://localhost:3000/productos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nombre, precio, stock })
  });

  cargarProductos();
}

// AGOTAR PRODUCTO
async function agotarProducto(id) {
  await fetch(`http://localhost:3000/productos/agotar/${id}`, {
    method: "PUT"
  });

  cargarProductos();
}

// ACTIVAR EDICIÓN
function activarEdicion(id) {
  document.getElementById(`nombre-${id}`).disabled = false;
  document.getElementById(`precio-${id}`).disabled = false;
  document.getElementById(`stock-${id}`).disabled = false;

  document.getElementById(`btnEditar-${id}`).style.display = "none";
  document.getElementById(`btnGuardar-${id}`).style.display = "inline";
  document.getElementById(`btnCancelar-${id}`).style.display = "inline";

  // 🔥 ocultar botón agotar
  document.getElementById(`btnAgotar-${id}`).style.display = "none";
}

// CANCELAR EDICIÓN
function cancelarEdicion(id, nombre, precio, stock) {
  document.getElementById(`nombre-${id}`).value = nombre;
  document.getElementById(`precio-${id}`).value = precio;
  document.getElementById(`stock-${id}`).value = stock;

  document.getElementById(`nombre-${id}`).disabled = true;
  document.getElementById(`precio-${id}`).disabled = true;
  document.getElementById(`stock-${id}`).disabled = true;

  document.getElementById(`btnEditar-${id}`).style.display = "inline";
  document.getElementById(`btnGuardar-${id}`).style.display = "none";
  document.getElementById(`btnCancelar-${id}`).style.display = "none";

  // 🔥 volver a mostrar botón agotar
  document.getElementById(`btnAgotar-${id}`).style.display = "inline";
}

// GUARDAR CAMBIOS
function guardarCambios(id) {
  const nombre = document.getElementById(`nombre-${id}`).value;
  const precio = document.getElementById(`precio-${id}`).value;
  const stock = document.getElementById(`stock-${id}`).value;

  if (!nombre || !precio || !stock) {
    alert("Completa todos los campos");
    return;
  }

  editarProducto(id, nombre, precio, stock);
}

// cargar automáticamente
window.onload = cargarProductos;