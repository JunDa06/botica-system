async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  if (!usuario || !password) {
    alert("Completa los campos");
    return;
  }

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usuario, password })
  });

  const data = await res.json();

  if (res.ok) {
    // 🔥 guardar token
    localStorage.setItem("token", data.token);

    // ir al sistema
    window.location.href = "index.html";
  } else {
    alert(data.error);
  }
}