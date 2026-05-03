// 🔥 LISTAS
let boletas = [];

// ==========================
// 📦 CARGAR BOLETAS
// ==========================
async function cargarHistorial() {
  try {
    const res = await fetch("http://localhost:3000/boletas");

    if (!res.ok) throw new Error("Error al obtener boletas");

    boletas = await res.json();

    mostrarHistorial(boletas);

    // limpiar detalle al inicio
    document.getElementById("detalleBoleta").innerHTML = `
      <tr><td colspan="3">Seleccione una boleta para ver el detalle</td></tr>
    `;

  } catch (error) {
    console.error(error);
    alert("Error cargando historial");
  }
}

// ==========================
// 🧾 MOSTRAR HISTORIAL
// ==========================
function mostrarHistorial(lista) {
  const tabla = document.getElementById("tablaHistorial");
  tabla.innerHTML = "";

  if (lista.length === 0) {
    tabla.innerHTML = `
      <tr>
        <td colspan="5">No hay ventas registradas</td>
      </tr>
    `;
    return;
  }

  lista.forEach(b => {
    const fecha = new Date(b.fecha).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      dateStyle: "short",
      timeStyle: "short"
    });

    const fila = `
      <tr>
        <td>${b.id}</td>
        <td>${b.cliente || "-"}</td>
        <td>S/ ${Number(b.total).toFixed(2)}</td>
        <td>${fecha}</td>
        <td>
          <button class="btn btn-small" onclick="verDetalle(${b.id})">
            Ver
          </button>
        </td>
      </tr>
    `;

    tabla.innerHTML += fila;
  });
}

// ==========================
// 🔍 FILTRAR
// ==========================
function filtrarHistorial() {
  const texto = document
    .getElementById("buscadorHistorial")
    .value
    .toLowerCase();

  const filtrados = boletas.filter(b =>
    (b.cliente || "").toLowerCase().includes(texto)
  );

  mostrarHistorial(filtrados);
}

async function verDetalle(id) {
  try {
    const res = await fetch(`http://localhost:3000/boletas/${id}`);

    if (!res.ok) throw new Error("Error al obtener detalle");

    const data = await res.json();

    const tabla = document.getElementById("detalleBoleta");
    tabla.innerHTML = "";

    if (data.length === 0) {
      tabla.innerHTML = `
        <tr>
          <td colspan="3">Sin productos</td>
        </tr>
      `;
      return;
    }

    data.forEach(p => {
      const fila = `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>S/ ${Number(p.precio).toFixed(2)}</td>
        </tr>
      `;
      tabla.innerHTML += fila;
    });

  } catch (error) {
    console.error(error);
    alert("Error cargando detalle");
  }
}

window.onload = cargarHistorial;