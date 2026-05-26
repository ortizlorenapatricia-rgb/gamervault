const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MONGO_URI = "mongodb+srv://ortizlorenapatricia_db_user:Lorena2024@cluster0.gmjaats.mongodb.net/tienda_videojuegos?appName=Cluster0";
// ✅ CORREGIDO: nombre exacto de la BD que crea seed.js
const DB_NAME   = "tienda_videojuegos";
const SECRET    = "gamervault_secret_2024";
let db;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const hash = (pw) => crypto.createHmac("sha256", SECRET).update(pw).digest("hex");

function makeToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ id: user._id, rol: user.rol, nombre: user.nombre })
  ).toString("base64");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (expected !== sig) return null;
  try { return JSON.parse(Buffer.from(payload, "base64").toString()); }
  catch { return null; }
}

// Middleware: cualquier usuario autenticado
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user  = verifyToken(token);
  if (!user) return res.status(401).json({ error: "No autenticado. Inicia sesión." });
  req.user = user;
  next();
}

// Middleware: solo administrador
function soloAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const user  = verifyToken(token);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  if (user.rol !== "admin") return res.status(403).json({ error: "Solo administradores pueden hacer esto." });
  req.user = user;
  next();
}

// ─── CONEXIÓN ─────────────────────────────────────────────────────────────────
let conectado = false;

async function conectarSiNecesario() {
  if (!conectado) {
    await conectar();
    conectado = true;
  }
}

// ✅ Middleware para conectar ANTES de todas las rutas (Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await conectarSiNecesario();
    next();
  } catch (err) {
    res.status(500).json({ error: "Error conectando a la base de datos: " + err.message });
  }
});

async function conectar() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("✅ Conectado a MongoDB →", DB_NAME);

  // Crear/actualizar admin por defecto (upsert garantiza contraseña correcta)
  await db.collection("usuarios").updateOne(
    { email: "admin@gamervault.com" },
    { $set: {
        nombre: "Administrador",
        email: "admin@gamervault.com",
        password: hash("admin123"),
        rol: "admin",
        activo: true,
      },
      $setOnInsert: { fechaRegistro: new Date() }
    },
    { upsert: true }
  );
  console.log("👤 Admin listo → admin@gamervault.com / admin123");

  // Índices
  await db.collection("usuarios").createIndex({ email: 1 }, { unique: true });
  await db.collection("resenas").createIndex(
    { juegoId: 1, usuarioId: 1 },
    { unique: true, partialFilterExpression: { usuarioId: { $type: "objectId" } } }
  );
  await db.collection("resenas").createIndex({ juegoId: 1 });
  await db.collection("transacciones").createIndex({ juegoId: 1 });
  await db.collection("transacciones").createIndex({ fecha: -1 });
  await db.collection("transacciones").createIndex({ estado: 1 });
  await db.collection("transacciones").createIndex({ pais: 1 });
  await db.collection("transacciones").createIndex({ anio: 1, mes: 1 });
  console.log("📌 Índices listos");
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

app.post("/api/auth/registro", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: "Nombre, email y contraseña son obligatorios" });
    if (password.length < 6)
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });

    const existe = await db.collection("usuarios").findOne({ email: email.toLowerCase() });
    if (existe) return res.status(400).json({ error: "El email ya está registrado" });

    const result = await db.collection("usuarios").insertOne({
      nombre,
      email: email.toLowerCase(),
      password: hash(password),
      rol: "usuario",
      fechaRegistro: new Date(),
      activo: true,
    });

    const user = { _id: result.insertedId, nombre, rol: "usuario" };
    res.status(201).json({ token: makeToken(user), nombre, rol: "usuario", id: result.insertedId, mensaje: "Registro exitoso" });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "El email ya está registrado" });
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña requeridos" });

    const user = await db.collection("usuarios").findOne({ email: email.toLowerCase() });
    if (!user || user.password !== hash(password))
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    if (!user.activo) return res.status(401).json({ error: "Cuenta desactivada" });

    res.json({
      token: makeToken(user),
      nombre: user.nombre,
      rol: user.rol,
      id: user._id,
      mensaje: "Login exitoso",
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/auth/perfil", auth, async (req, res) => {
  try {
    const user = await db.collection("usuarios").findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// USUARIOS — solo admin
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/usuarios", soloAdmin, async (req, res) => {
  try {
    const users = await db.collection("usuarios")
      .find({}, { projection: { password: 0 } })
      .sort({ fechaRegistro: -1 }).toArray();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/usuarios/:id/rol", soloAdmin, async (req, res) => {
  try {
    const { rol } = req.body;
    if (!["admin","usuario"].includes(rol)) return res.status(400).json({ error: "Rol inválido" });
    await db.collection("usuarios").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { rol } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/usuarios/:id", soloAdmin, async (req, res) => {
  try {
    await db.collection("usuarios").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// JUEGOS — lectura pública, escritura solo admin
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/juegos", async (req, res) => {
  try {
    const { page=1, limit=20, categoria, buscar, oferta, orden } = req.query;
    const skip = (parseInt(page)-1) * parseInt(limit);
    const filtro = {};

    if (categoria) {
      try { filtro.categoriaId = new ObjectId(categoria); } catch {}
    }
    if (oferta === "true") filtro.enOferta = true;
    if (buscar) filtro.$or = [
      { nombre:        { $regex: buscar, $options:"i" } },
      { desarrollador: { $regex: buscar, $options:"i" } },
      { genero:        { $regex: buscar, $options:"i" } },
    ];

    let sortObj = { fechaRegistro: -1 };
    if (orden === "precio_asc")  sortObj = { precio: 1 };
    if (orden === "precio_desc") sortObj = { precio: -1 };
    if (orden === "metacritic")  sortObj = { metacritic: -1 };
    if (orden === "likes")       sortObj = { likes: -1 };
    if (orden === "nombre")      sortObj = { nombre: 1 };

    const [juegos, total] = await Promise.all([
      db.collection("juegos")
        .find(filtro).sort(sortObj).skip(skip).limit(parseInt(limit))
        .project({ reseñasDestacadas: 0, requisitos: 0 }).toArray(),
      db.collection("juegos").countDocuments(filtro),
    ]);

    const catIds = [...new Set(juegos.map(j=>j.categoriaId?.toString()).filter(Boolean))];
    const cats   = catIds.length
      ? await db.collection("categorias").find({ _id: { $in: catIds.map(id=>new ObjectId(id)) } }).toArray()
      : [];
    const catMap = Object.fromEntries(cats.map(c=>[c._id.toString(),c]));

    const enriched = juegos.map(j => ({
      ...j,
      categoria: catMap[j.categoriaId?.toString()] || null,
    }));

    res.json({ juegos: enriched, total, page: parseInt(page), totalPages: Math.ceil(total/parseInt(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/juegos/:id", async (req, res) => {
  try {
    const juego = await db.collection("juegos").findOne({ _id: new ObjectId(req.params.id) });
    if (!juego) return res.status(404).json({ error: "Juego no encontrado" });
    const categoria = juego.categoriaId
      ? await db.collection("categorias").findOne({ _id: juego.categoriaId })
      : null;
    res.json({ ...juego, categoria });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/juegos", soloAdmin, async (req, res) => {
  try {
    const { nombre, desarrollador, genero, categoriaId, plataformas, precio, metacritic, likes, stock, url, clasificacion, multijugador, descuento } = req.body;
    if (!nombre || !precio) return res.status(400).json({ error: "Nombre y precio son obligatorios" });

    const desc = parseInt(descuento) || 0;
    const precioNum = parseFloat(precio);
    const nuevo = {
      nombre, desarrollador: desarrollador||"", genero: genero||"Acción",
      categoriaId: categoriaId ? new ObjectId(categoriaId) : null,
      plataformas: (plataformas||[]).map(id => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean),
      precio: parseFloat((precioNum*(1-desc/100)).toFixed(2)),
      precioOriginal: precioNum,
      descuento: desc, enOferta: desc>0,
      metacritic: parseInt(metacritic)||0,
      likes: parseInt(likes)||0, ventas: 0,
      stock: parseInt(stock)||0,
      calificacion: 0, numReseñas: 0,
      url: url||"", imagen: "",
      idiomas: ["Español","Inglés"], modos: ["Un jugador"],
      clasificacion: clasificacion||"E",
      multijugador: multijugador===true||multijugador==="true",
      fechaLanzamiento: new Date(), fechaRegistro: new Date(),
      destacado: false, dlc: false,
      reseñasDestacadas: [], requisitos: { minimos:{}, recomendados:{} },
    };

    const result = await db.collection("juegos").insertOne(nuevo);
    res.status(201).json({ _id: result.insertedId, ...nuevo });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/juegos/:id", soloAdmin, async (req, res) => {
  try {
    const b = req.body;
    const upd = {};
    if (b.nombre !== undefined)        upd.nombre        = b.nombre;
    if (b.desarrollador !== undefined) upd.desarrollador = b.desarrollador;
    if (b.genero !== undefined)        upd.genero        = b.genero;
    if (b.precio !== undefined)        upd.precio        = parseFloat(b.precio);
    if (b.descuento !== undefined) {
      upd.descuento = parseInt(b.descuento);
      upd.enOferta  = parseInt(b.descuento)>0;
    }
    if (b.metacritic !== undefined)    upd.metacritic    = parseInt(b.metacritic);
    if (b.likes !== undefined)         upd.likes         = parseInt(b.likes);
    if (b.stock !== undefined)         upd.stock         = parseInt(b.stock);
    if (b.clasificacion !== undefined) upd.clasificacion = b.clasificacion;
    if (b.multijugador !== undefined)  upd.multijugador  = b.multijugador===true||b.multijugador==="true";
    if (b.url !== undefined)           upd.url           = b.url;
    if (b.categoriaId)                 upd.categoriaId   = new ObjectId(b.categoriaId);

    const r = await db.collection("juegos").updateOne({ _id: new ObjectId(req.params.id) }, { $set: upd });
    if (r.matchedCount===0) return res.status(404).json({ error: "No encontrado" });
    res.json({ ok: true, modificados: r.modifiedCount });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/juegos/:id", soloAdmin, async (req, res) => {
  try {
    const r = await db.collection("juegos").deleteOne({ _id: new ObjectId(req.params.id) });
    if (r.deletedCount===0) return res.status(404).json({ error: "No encontrado" });
    // Limpiar reseñas huérfanas
    await db.collection("resenas").deleteMany({ juegoId: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// RESEÑAS
// Público: ver reseñas
// Usuario autenticado: crear reseña (1 por juego), editar la propia
// Admin: eliminar cualquier reseña
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/juegos/:id/resenas — PÚBLICO (sin token)
app.get("/api/juegos/:id/resenas", async (req, res) => {
  try {
    const resenas = await db.collection("resenas")
      .find({ juegoId: new ObjectId(req.params.id) })
      .sort({ fecha: -1 }).toArray();
    res.json(resenas);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/juegos/:id/resenas — público (anónimo o autenticado)
app.post("/api/juegos/:id/resenas", async (req, res) => {
  try {
    const { puntuacion, comentario, nombreAnonimo } = req.body;
    if (!puntuacion || !comentario)
      return res.status(400).json({ error: "Puntuación y comentario son obligatorios" });
    if (puntuacion < 1 || puntuacion > 5)
      return res.status(400).json({ error: "La puntuación debe ser entre 1 y 5" });

    const juegoId = new ObjectId(req.params.id);

    // Intentar leer token si viene (usuario logueado)
    const rawToken = (req.headers.authorization || "").replace("Bearer ", "");
    const userAuth = verifyToken(rawToken);

    const juego = await db.collection("juegos").findOne({ _id: juegoId });
    if (!juego) return res.status(404).json({ error: "Juego no encontrado" });

    // Si está autenticado: verificar que no haya reseñado ya
    if (userAuth) {
      const usuarioId = new ObjectId(userAuth.id);
      const yaReseno = await db.collection("resenas").findOne({ juegoId, usuarioId });
      if (yaReseno) return res.status(400).json({ error: "Ya escribiste una reseña para este juego" });
    }

    const resena = {
      juegoId,
      usuarioId:     userAuth ? new ObjectId(userAuth.id) : null,
      usuarioNombre: userAuth ? userAuth.nombre : (nombreAnonimo?.trim() || "Anónimo"),
      esAnonimo:     !userAuth,
      puntuacion:    parseInt(puntuacion),
      comentario:    comentario.trim().substring(0, 500),
      fecha:         new Date(),
    };

    await db.collection("resenas").insertOne(resena);

    // Recalcular calificación promedio
    const stats = await db.collection("resenas").aggregate([
      { $match: { juegoId } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, total: { $sum: 1 } } }
    ]).toArray();

    if (stats.length > 0) {
      await db.collection("juegos").updateOne({ _id: juegoId }, {
        $set: {
          calificacion: parseFloat(stats[0].promedio.toFixed(1)),
          numReseñas:   stats[0].total,
        }
      });
    }

    res.status(201).json({ ok: true, resena });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/resenas/:id — usuario edita su propia reseña
app.put("/api/resenas/:id", auth, async (req, res) => {
  try {
    const { puntuacion, comentario } = req.body;
    if (!puntuacion || !comentario)
      return res.status(400).json({ error: "Puntuación y comentario son obligatorios" });
    if (puntuacion < 1 || puntuacion > 5)
      return res.status(400).json({ error: "La puntuación debe ser entre 1 y 5" });

    const resena = await db.collection("resenas").findOne({ _id: new ObjectId(req.params.id) });
    if (!resena) return res.status(404).json({ error: "Reseña no encontrada" });

    // Solo el autor o un admin puede editar
    if (resena.usuarioId.toString() !== req.user.id && req.user.rol !== "admin")
      return res.status(403).json({ error: "No tienes permiso para editar esta reseña" });

    await db.collection("resenas").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { puntuacion: parseInt(puntuacion), comentario: comentario.trim().substring(0, 500), editada: true, fechaEdicion: new Date() } }
    );

    // Recalcular calificación
    const stats = await db.collection("resenas").aggregate([
      { $match: { juegoId: resena.juegoId } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, total: { $sum: 1 } } }
    ]).toArray();
    if (stats.length > 0) {
      await db.collection("juegos").updateOne({ _id: resena.juegoId }, {
        $set: { calificacion: parseFloat(stats[0].promedio.toFixed(1)), numReseñas: stats[0].total }
      });
    }

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/resenas/:id — admin elimina cualquiera, usuario elimina la propia
app.delete("/api/resenas/:id", auth, async (req, res) => {
  try {
    const resena = await db.collection("resenas").findOne({ _id: new ObjectId(req.params.id) });
    if (!resena) return res.status(404).json({ error: "Reseña no encontrada" });

    if (resena.usuarioId.toString() !== req.user.id && req.user.rol !== "admin")
      return res.status(403).json({ error: "No tienes permiso para eliminar esta reseña" });

    await db.collection("resenas").deleteOne({ _id: new ObjectId(req.params.id) });

    // Recalcular calificación
    const stats = await db.collection("resenas").aggregate([
      { $match: { juegoId: resena.juegoId } },
      { $group: { _id: null, promedio: { $avg: "$puntuacion" }, total: { $sum: 1 } } }
    ]).toArray();
    await db.collection("juegos").updateOne({ _id: resena.juegoId }, {
      $set: {
        calificacion: stats.length > 0 ? parseFloat(stats[0].promedio.toFixed(1)) : 0,
        numReseñas:   stats.length > 0 ? stats[0].total : 0,
      }
    });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// CATEGORÍAS
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/categorias", async (req, res) => {
  try {
    const cats = await db.collection("categorias").find({}).sort({ nombre: 1 }).toArray();
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/categorias", soloAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;
    if (!nombre) return res.status(400).json({ error: "Nombre requerido" });
    const r = await db.collection("categorias").insertOne({
      nombre, descripcion: descripcion||"", icono: icono||"🎮",
      etiquetas:[], popularidad:50, activo:true, fechaCreacion: new Date()
    });
    res.status(201).json({ _id: r.insertedId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/categorias/:id", soloAdmin, async (req, res) => {
  try {
    await db.collection("categorias").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// PLATAFORMAS
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/plataformas", async (req, res) => {
  try {
    const plats = await db.collection("plataformas").find({}).toArray();
    res.json(plats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// AGGREGATES
// ══════════════════════════════════════════════════════════════════════════════

app.get("/api/stats/por-categoria", async (req, res) => {
  try {
    const top = parseInt(req.query.top)||15;
    const data = await db.collection("juegos").aggregate([
      { $match: { precio: { $exists: true } } },
      { $lookup: { from:"categorias", localField:"categoriaId", foreignField:"_id", as:"cat" } },
      { $unwind: { path:"$cat", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: "$cat.nombre",
          icono:              { $first: "$cat.icono" },
          totalJuegos:        { $sum: 1 },
          totalVentas:        { $sum: "$ventas" },
          totalLikes:         { $sum: "$likes" },
          promedioMetacritic: { $avg: "$metacritic" },
          precioPromedio:     { $avg: "$precio" },
          precioMinimo:       { $min: "$precio" },
          precioMaximo:       { $max: "$precio" },
          juegoEnOferta:      { $sum: { $cond: ["$enOferta",1,0] } },
      }},
      { $project: {
          _id: 0,
          categoria:          { $ifNull: ["$_id","Sin categoría"] },
          icono:              { $ifNull: ["$icono","🎮"] },
          totalJuegos:1, totalVentas:1, totalLikes:1, juegoEnOferta:1,
          promedioMetacritic: { $round: ["$promedioMetacritic",1] },
          precioPromedio:     { $round: ["$precioPromedio",2] },
          precioMinimo:       { $round: ["$precioMinimo",2] },
          precioMaximo:       { $round: ["$precioMaximo",2] },
      }},
      { $sort: { totalVentas: -1 } },
      { $limit: top },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/stats/por-plataforma", async (req, res) => {
  try {
    const data = await db.collection("juegos").aggregate([
      { $match: { plataformas: { $exists:true, $ne:[] } } },
      { $unwind: "$plataformas" },
      { $lookup: { from:"plataformas", localField:"plataformas", foreignField:"_id", as:"plat" } },
      { $unwind: { path:"$plat", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id:               "$plat.nombre",
          fabricante:        { $first: "$plat.fabricante" },
          tipo:              { $first: "$plat.tipo" },
          totalJuegos:       { $sum: 1 },
          precioPromedio:    { $avg: "$precio" },
          precioMin:         { $min: "$precio" },
          precioMax:         { $max: "$precio" },
          descuentoPromedio: { $avg: "$descuento" },
          enOferta:          { $sum: { $cond: ["$enOferta",1,0] } },
      }},
      { $project: {
          _id:0,
          plataforma:        { $ifNull: ["$_id","Sin plataforma"] },
          fabricante:1, tipo:1, totalJuegos:1, enOferta:1,
          precioPromedio:    { $round: ["$precioPromedio",2] },
          precioMin:         { $round: ["$precioMin",2] },
          precioMax:         { $round: ["$precioMax",2] },
          descuentoPromedio: { $round: ["$descuentoPromedio",1] },
      }},
      { $sort: { totalJuegos:-1 } },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/stats/ranking", async (req, res) => {
  try {
    const top      = parseInt(req.query.top)||10;
    const criterio = ["likes","ventas","metacritic"].includes(req.query.criterio) ? req.query.criterio : "likes";
    const data = await db.collection("juegos").aggregate([
      { $match: { [criterio]: { $gt:0 } } },
      { $lookup: { from:"categorias", localField:"categoriaId", foreignField:"_id", as:"cat" } },
      { $unwind: { path:"$cat", preserveNullAndEmptyArrays: true } },
      { $project: {
          nombre:1, desarrollador:1, genero:1, precio:1,
          metacritic:1, likes:1, ventas:1, calificacion:1, numReseñas:1,
          categoria: { $ifNull: ["$cat.nombre","Sin categoría"] },
          icono:     { $ifNull: ["$cat.icono","🎮"] },
          score:     `$${criterio}`,
      }},
      { $sort: { score:-1 } },
      { $limit: top },
    ]).toArray();
    res.json(data.map((j,i)=>({ ...j, posicion:i+1 })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/stats/por-anio", async (req, res) => {
  try {
    const data = await db.collection("juegos").aggregate([
      { $match: { fechaLanzamiento: { $exists:true, $type:"date" } } },
      { $group: {
          _id:               { $year:"$fechaLanzamiento" },
          totalJuegos:       { $sum:1 },
          promedioMetacritic:{ $avg:"$metacritic" },
          totalLikes:        { $sum:"$likes" },
          precioPromedio:    { $avg:"$precio" },
          totalVentas:       { $sum:"$ventas" },
      }},
      { $project: {
          _id:0, anio:"$_id", totalJuegos:1, totalLikes:1, totalVentas:1,
          promedioMetacritic:{ $round:["$promedioMetacritic",1] },
          precioPromedio:    { $round:["$precioPromedio",2] },
      }},
      { $sort: { anio:1 } },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/stats/dashboard", async (req, res) => {
  try {
    const [totalJuegos, totalCats, totalPlats, enOferta, totalUsuarios, totalResenas, totalTransacciones, resumen] = await Promise.all([
      db.collection("juegos").countDocuments(),
      db.collection("categorias").countDocuments(),
      db.collection("plataformas").countDocuments(),
      db.collection("juegos").countDocuments({ enOferta:true }),
      db.collection("usuarios").countDocuments(),
      db.collection("resenas").countDocuments(),
      db.collection("transacciones").countDocuments({ estado: "completada" }),
      db.collection("juegos").aggregate([
        { $group: { _id:null,
            precioPromedio:{ $avg:"$precio" },
            precioMin:     { $min:"$precio" },
            precioMax:     { $max:"$precio" },
            totalLikes:    { $sum:"$likes" },
            totalVentas:   { $sum:"$ventas" },
        }},
        { $project: { _id:0,
            precioPromedio:{ $round:["$precioPromedio",2] },
            precioMin:1, precioMax:1, totalLikes:1, totalVentas:1,
        }}
      ]).toArray(),
    ]);
    res.json({ totalJuegos, totalCats, totalPlats, enOferta, totalUsuarios, totalResenas, totalTransacciones, ...(resumen[0]||{}) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// TRANSACCIONES — aggregate de ventas reales
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/stats/transacciones — resumen general de transacciones con $lookup a juegos
app.get("/api/stats/transacciones", async (req, res) => {
  try {
    const data = await db.collection("transacciones").aggregate([
      { $match: { estado: "completada" } },
      { $lookup: {
          from: "juegos",
          localField: "juegoId",
          foreignField: "_id",
          as: "juego"
      }},
      { $unwind: { path: "$juego", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: { anio: "$anio", mes: "$mes" },
          totalTransacciones: { $sum: 1 },
          totalRecaudado:     { $sum: "$total" },
          totalUnidades:      { $sum: "$cantidad" },
          promedioTicket:     { $avg: "$total" },
          descuentoPromedio:  { $avg: "$descuento" },
      }},
      { $project: {
          _id: 0,
          anio:               "$_id.anio",
          mes:                "$_id.mes",
          totalTransacciones: 1,
          totalUnidades:      1,
          totalRecaudado:     { $round: ["$totalRecaudado", 2] },
          promedioTicket:     { $round: ["$promedioTicket", 2] },
          descuentoPromedio:  { $round: ["$descuentoPromedio", 1] },
      }},
      { $sort: { anio: 1, mes: 1 } },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stats/transacciones/por-pais — ranking de ventas por país
app.get("/api/stats/transacciones/por-pais", async (req, res) => {
  try {
    const data = await db.collection("transacciones").aggregate([
      { $match: { estado: "completada" } },
      { $group: {
          _id:                "$pais",
          totalTransacciones: { $sum: 1 },
          totalRecaudado:     { $sum: "$total" },
          promedioTicket:     { $avg: "$total" },
      }},
      { $project: {
          _id: 0,
          pais:               "$_id",
          totalTransacciones: 1,
          totalRecaudado:     { $round: ["$totalRecaudado", 2] },
          promedioTicket:     { $round: ["$promedioTicket", 2] },
      }},
      { $sort: { totalRecaudado: -1 } },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stats/transacciones/por-metodo — ventas por método de pago
app.get("/api/stats/transacciones/por-metodo", async (req, res) => {
  try {
    const data = await db.collection("transacciones").aggregate([
      { $match: { estado: { $in: ["completada", "pendiente"] } } },
      { $group: {
          _id:                "$metodoPago",
          totalTransacciones: { $sum: 1 },
          totalRecaudado:     { $sum: "$total" },
          completadas:        { $sum: { $cond: [{ $eq: ["$estado","completada"] }, 1, 0] } },
          pendientes:         { $sum: { $cond: [{ $eq: ["$estado","pendiente"]  }, 1, 0] } },
      }},
      { $project: {
          _id: 0,
          metodoPago:         "$_id",
          totalTransacciones: 1,
          completadas:        1,
          pendientes:         1,
          totalRecaudado:     { $round: ["$totalRecaudado", 2] },
      }},
      { $sort: { totalTransacciones: -1 } },
    ]).toArray();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── INICIO ───────────────────────────────────────────────────────────────────

// Para desarrollo local
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  conectar().then(() => {
    app.listen(PORT, () => {
      console.log("GamerVault corriendo en http://localhost:" + PORT);
    });
  }).catch(err => {
    console.error("Error MongoDB:", err.message);
    process.exit(1);
  });
}

module.exports = app;
