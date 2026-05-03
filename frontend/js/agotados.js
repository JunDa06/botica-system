let productosAgotados = [];

// CARGAR PRODUCTOS AGOTADOS
async function cargarAgotados() {
  const res = await fetch("http://localhost:3000/productos/agotados");
  productosAgotados = await res.json();

  mostrarAgotados(productosAgotados);
}

// MOSTRAR PRODUCTOS
function mostrarAgotados(lista) {
  const tabla = document.getElementById("tablaAgotados");
  tabla.innerHTML = "";

  lista.forEach(p => {
    const fila = `
      <tr>
        <td>${p.nombre}</td>
        <td>S/ ${p.precio}</td>
        <td style="color:red; font-weight:bold;">Agotado</td>
        <td>
          <button onclick="reponerProducto(${p.id})">Reponer</button>
        </td>
      </tr>
    `;
    tabla.innerHTML += fila;
  });
}

// 🔍 FILTRAR PRODUCTOS
function filtrarAgotados() {
  const texto = document.getElementById("buscadorAgotados").value.toLowerCase();

  const filtrados = productosAgotados.filter(p =>
    p.nombre.toLowerCase().includes(texto)
  );

  mostrarAgotados(filtrados);
}

// REPONER PRODUCTO
async function reponerProducto(id) {
  await fetch(`http://localhost:3000/productos/reponer/${id}`, {
    method: "PUT"
  });

  cargarAgotados();
}

// cargar automáticamente
window.onload = cargarAgotados;