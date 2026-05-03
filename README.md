# 💊 Botica System

Sistema web desarrollado para mejorar la gestión de inventario y ventas de la botica **Nova Salud**.

---

## 👨‍💻 Autor

**Dayron Cavero Alvarez**

---

## 📌 Descripción

Este proyecto nace como solución a los problemas de control manual en la botica Nova Salud, donde se presentaban errores en el stock, desabastecimientos frecuentes y demoras en la atención.

La aplicación permite gestionar productos, registrar ventas y consultar un historial completo, todo de forma centralizada y en tiempo real.

---

## 🚀 Funcionalidades

* 🔐 Inicio de sesión con seguridad (JWT + bcrypt)
* 📦 Gestión de productos (crear, editar, stock)
* 📉 Detección automática de productos agotados
* 🛒 Sistema de ventas con carrito
* 🧾 Generación de boletas en PDF
* 📊 Historial de ventas con detalle por boleta
* 🔍 Búsqueda en tiempo real
* ⚙️ Actualización automática del stock

---

## 🛠️ Tecnologías utilizadas

**Backend**

* Node.js
* Express
* PostgreSQL (Railway)
* jsonwebtoken
* bcrypt

**Frontend**

* HTML
* CSS
* JavaScript
* jsPDF

---

## 🗄️ Base de datos

El sistema utiliza las siguientes tablas:

* `usuarios`
* `productos`
* `boletas`
* `detalle_boleta`

---

## ⚙️ Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/JunDa06/botica-system.git
```

2. Entrar al proyecto:

```bash
cd botica-system
```

3. Instalar dependencias:

```bash
npm install
```

4. Crear archivo `.env` con la conexión a PostgreSQL:

```env
DATABASE_URL=tu_url_de_base_de_datos
```

---

## ▶️ Ejecución del servidor

El servidor se inicia manualmente con:

```bash
node server.js
```

Luego abrir en el navegador:

```bash
http://localhost:3000
```

---

## 🎯 Resultados

Con este sistema se logró:

* Reducir errores en el control de inventario
* Automatizar el registro de ventas
* Mejorar la velocidad de atención
* Tener control en tiempo real del stock

---

## 🚧 Mejoras futuras

* Alertas de productos con bajo stock
* Dashboard con estadísticas
* Roles de usuario (admin / vendedor)
* Reposición con cantidad personalizada

---

## 📌 Estado del proyecto

✅ Versión 1.0 finalizada

---

## 📄 Nota

El sistema fue desarrollado con fines académicos como solución al caso práctico planteado para la botica Nova Salud.
