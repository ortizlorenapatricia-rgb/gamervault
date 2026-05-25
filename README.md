# 🎮 GamerVault — Tienda de Videojuegos
**Proyecto Final Electiva IV — MongoDB + Node.js + Express**

---

## ⚙️ Instalación paso a paso (VS Code)

### Prerrequisitos
- Node.js v18+
- MongoDB Community 6+ corriendo en `localhost:27017`
- mongosh instalado

### Paso 1 — Instalar dependencias
Abre la terminal integrada de VS Code (`Ctrl+ñ`) y ejecuta:
```bash
npm install
```

### Paso 2 — Cargar la base de datos
```bash
mongosh mongodb://localhost:27017 seed/seed.js
```
Crea la BD `tienda_videojuegos` con 15 categorías, 8 plataformas y 1050+ juegos.

### Paso 3 — Levantar el servidor
```bash
npm start
# o en modo desarrollo (se reinicia automático):
npm run dev
```

### Paso 4 — Abrir la app
Ve a: **http://localhost:3000**

---

## 👤 Credenciales por defecto

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Admin | admin@gamervault.com | admin123 |
| Usuario | (regístrate en la app) | min 6 caracteres |

---

## 🗂️ Estructura del proyecto
```
gamervault/
├── public/
│   └── index.html       ← Frontend completo
├── seed/
│   └── seed.js          ← Datos iniciales (1050+ docs)
├── server.js            ← API REST + autenticación
├── package.json
└── README.md
```

---

## 🔐 Sistema de Seguridad (Roles)

### Usuario público (sin login)
- Ver el catálogo de juegos
- Ver detalle de juegos
- Leer reseñas
- Acceso a estadísticas y aggregates

### Usuario autenticado (rol: usuario)
- Todo lo anterior +
- Escribir una reseña por juego (máx. 1)
- Editar su propia reseña
- Borrar su propia reseña

### Administrador (rol: admin)
- Todo lo anterior +
- Crear, editar y eliminar juegos
- Gestionar usuarios y cambiar roles
- Eliminar CUALQUIER reseña (moderación)
- Panel dedicado "Moderar Reseñas"
- Ver estadísticas de usuarios y reseñas en Dashboard

---

## 💬 Sistema de Reseñas

### Endpoints
| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | /api/juegos/:id/resenas | Público | Ver reseñas |
| POST | /api/juegos/:id/resenas | Usuario auth | Crear reseña |
| PUT | /api/resenas/:id | Usuario auth | Editar propia |
| DELETE | /api/resenas/:id | Auth (propia) o Admin | Eliminar |

### Reglas
- Máximo 1 reseña por usuario por juego
- Puntuación: 1-5 estrellas
- Comentario: máx. 500 caracteres
- Al crear/editar/borrar, recalcula automáticamente la calificación del juego

---

## 🔌 Todos los Endpoints API

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | /api/auth/registro | Público |
| POST | /api/auth/login | Público |
| GET | /api/auth/perfil | Auth |
| GET | /api/juegos | Público |
| GET | /api/juegos/:id | Público |
| POST | /api/juegos | Admin |
| PUT | /api/juegos/:id | Admin |
| DELETE | /api/juegos/:id | Admin |
| GET | /api/juegos/:id/resenas | Público |
| POST | /api/juegos/:id/resenas | Usuario |
| PUT | /api/resenas/:id | Usuario (propia) |
| DELETE | /api/resenas/:id | Usuario/Admin |
| GET | /api/categorias | Público |
| POST | /api/categorias | Admin |
| DELETE | /api/categorias/:id | Admin |
| GET | /api/plataformas | Público |
| GET | /api/usuarios | Admin |
| PUT | /api/usuarios/:id/rol | Admin |
| DELETE | /api/usuarios/:id | Admin |
| GET | /api/stats/dashboard | Público |
| GET | /api/stats/por-categoria | Público |
| GET | /api/stats/por-plataforma | Público |
| GET | /api/stats/ranking | Público |
| GET | /api/stats/por-anio | Público |
