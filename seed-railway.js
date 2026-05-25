/**
 * SEED SCRIPT para Railway/Node.js
 * Uso: node seed-railway.js
 * Lee MONGO_URL del entorno automáticamente
 */

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URL || "mongodb://localhost:27017";
const DB_NAME   = process.env.DB_NAME   || "tienda_videojuegos";

// ─── Helpers ───────────────────────────────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }
function randSubset(arr, min, max) {
  const n = randInt(min, max);
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  console.log("✅ Conectado a MongoDB →", DB_NAME);

  // ─── Limpiar ───────────────────────────────────────────────────────────
  await db.collection("categorias").drop().catch(() => {});
  await db.collection("plataformas").drop().catch(() => {});
  await db.collection("juegos").drop().catch(() => {});
  await db.collection("resenas").drop().catch(() => {});
  console.log("🗑️  Colecciones eliminadas. Iniciando seed...");

  // ─── 1. CATEGORÍAS ─────────────────────────────────────────────────────
  const categoriasData = [
    { nombre: "Acción",        descripcion: "Juegos de acción frenética y combate intenso",       etiquetas: ["combate","velocidad","reflejos"],       icono: "⚔️",  popularidad: 95 },
    { nombre: "Aventura",      descripcion: "Exploración y narrativa profunda",                   etiquetas: ["historia","exploración","puzzles"],      icono: "🗺️",  popularidad: 88 },
    { nombre: "RPG",           descripcion: "Rol y desarrollo de personajes",                     etiquetas: ["personajes","historia","progresión"],    icono: "🧙",  popularidad: 92 },
    { nombre: "Deportes",      descripcion: "Simulación de deportes reales y ficticios",          etiquetas: ["competición","equipos","realismo"],      icono: "⚽",  popularidad: 78 },
    { nombre: "Estrategia",    descripcion: "Planificación táctica y gestión de recursos",        etiquetas: ["táctica","planificación","gestión"],     icono: "♟️",  popularidad: 72 },
    { nombre: "Terror",        descripcion: "Suspenso y horror psicológico",                      etiquetas: ["miedo","suspenso","horror"],             icono: "👻",  popularidad: 70 },
    { nombre: "Simulación",    descripcion: "Simuladores de vida, vuelo, conducción y más",       etiquetas: ["realismo","gestión","vida"],             icono: "🛫",  popularidad: 65 },
    { nombre: "Plataformas",   descripcion: "Saltos, obstáculos y niveles clásicos",              etiquetas: ["saltos","obstáculos","clásico"],         icono: "🍄",  popularidad: 80 },
    { nombre: "Pelea",         descripcion: "Combate uno a uno o en grupos",                      etiquetas: ["combate","1v1","torneo"],                icono: "🥊",  popularidad: 68 },
    { nombre: "Shooter",       descripcion: "Disparos en primera o tercera persona",              etiquetas: ["disparos","FPS","TPS"],                  icono: "🔫",  popularidad: 90 },
    { nombre: "Carreras",      descripcion: "Velocidad y competición en circuitos",               etiquetas: ["velocidad","coches","circuitos"],        icono: "🏎️",  popularidad: 73 },
    { nombre: "Indie",         descripcion: "Desarrolladores independientes y creativos",         etiquetas: ["independiente","creativo","innovador"],  icono: "🎨",  popularidad: 82 },
    { nombre: "MMORPG",        descripcion: "Rol masivo multijugador en línea",                   etiquetas: ["online","multijugador","mundo abierto"], icono: "🌐",  popularidad: 75 },
    { nombre: "Battle Royale", descripcion: "Supervivencia del más fuerte en partidas masivas",   etiquetas: ["supervivencia","masivo","competitivo"],  icono: "🏆",  popularidad: 87 },
    { nombre: "Puzzles",       descripcion: "Desafíos mentales y rompecabezas",                   etiquetas: ["lógica","desafío","mental"],             icono: "🧩",  popularidad: 60 },
  ];
  const catRes = await db.collection("categorias").insertMany(
    categoriasData.map(c => ({ ...c, fechaCreacion: new Date(), activo: true }))
  );
  const catIds = Object.values(catRes.insertedIds);
  console.log(`✅ ${catIds.length} categorías insertadas`);

  // ─── 2. PLATAFORMAS ────────────────────────────────────────────────────
  const plataformasData = [
    { nombre: "PlayStation 5",   fabricante: "Sony",      tipo: "Consola",     anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2",        ram: "16GB GDDR6", almacenamiento: "825GB SSD"  }, precio_consola: 499.99, activa: true  },
    { nombre: "Xbox Series X",   fabricante: "Microsoft", tipo: "Consola",     anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2 12TF",   ram: "16GB GDDR6", almacenamiento: "1TB SSD"    }, precio_consola: 499.99, activa: true  },
    { nombre: "Nintendo Switch", fabricante: "Nintendo",  tipo: "Híbrida",     anioLanzamiento: 2017, especificaciones: { cpu: "NVIDIA Tegra X1+",  gpu: "Maxwell",           ram: "4GB LPDDR4", almacenamiento: "32GB eMMC"  }, precio_consola: 299.99, activa: true  },
    { nombre: "PC",              fabricante: "Varios",    tipo: "Computadora", anioLanzamiento: 1980, especificaciones: { cpu: "Variable",          gpu: "Variable",          ram: "Variable",   almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
    { nombre: "PlayStation 4",   fabricante: "Sony",      tipo: "Consola",     anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.84TF",    ram: "8GB GDDR5",  almacenamiento: "500GB HDD"  }, precio_consola: 299.99, activa: false },
    { nombre: "Xbox One",        fabricante: "Microsoft", tipo: "Consola",     anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.4TF",     ram: "8GB DDR3",   almacenamiento: "500GB HDD"  }, precio_consola: 249.99, activa: false },
    { nombre: "iOS",             fabricante: "Apple",     tipo: "Móvil",       anioLanzamiento: 2007, especificaciones: { cpu: "Apple Silicon",     gpu: "Apple GPU",         ram: "Variable",   almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
    { nombre: "Android",         fabricante: "Google",    tipo: "Móvil",       anioLanzamiento: 2008, especificaciones: { cpu: "Variable ARM",      gpu: "Variable",          ram: "Variable",   almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
  ];
  const platRes = await db.collection("plataformas").insertMany(
    plataformasData.map(p => ({ ...p, fechaRegistro: new Date() }))
  );
  const platIds = Object.values(platRes.insertedIds);
  console.log(`✅ ${platIds.length} plataformas insertadas`);

  // ─── 3. JUEGOS ─────────────────────────────────────────────────────────
  const juegosBase = [
    { nombre: "Black Myth: Wukong",        desarrollador: "Game Science",              genero: "Acción/RPG",           precioBase: 59.99, metacritic: 82 },
    { nombre: "Astro Bot",                 desarrollador: "Team Asobi",                genero: "Plataformas",          precioBase: 59.99, metacritic: 94 },
    { nombre: "Elden Ring",                desarrollador: "FromSoftware",              genero: "RPG/Acción",           precioBase: 59.99, metacritic: 96 },
    { nombre: "God of War Ragnarök",       desarrollador: "Santa Monica Studio",       genero: "Acción/Aventura",      precioBase: 69.99, metacritic: 94 },
    { nombre: "Hogwarts Legacy",           desarrollador: "Avalanche Software",        genero: "RPG/Aventura",         precioBase: 59.99, metacritic: 84 },
    { nombre: "Cyberpunk 2077",            desarrollador: "CD Projekt Red",            genero: "RPG/Acción",           precioBase: 59.99, metacritic: 86 },
    { nombre: "The Legend of Zelda: TotK", desarrollador: "Nintendo",                  genero: "Aventura/RPG",         precioBase: 69.99, metacritic: 96 },
    { nombre: "Spider-Man 2",             desarrollador: "Insomniac Games",           genero: "Acción/Aventura",      precioBase: 69.99, metacritic: 90 },
    { nombre: "Final Fantasy XVI",         desarrollador: "Square Enix",              genero: "RPG/Acción",           precioBase: 69.99, metacritic: 87 },
    { nombre: "Starfield",                 desarrollador: "Bethesda Game Studios",     genero: "RPG/Sci-Fi",           precioBase: 69.99, metacritic: 83 },
    { nombre: "Baldur's Gate 3",           desarrollador: "Larian Studios",            genero: "RPG",                  precioBase: 59.99, metacritic: 96 },
    { nombre: "Alan Wake 2",              desarrollador: "Remedy Entertainment",      genero: "Terror/Aventura",      precioBase: 59.99, metacritic: 89 },
    { nombre: "Resident Evil 4 Remake",   desarrollador: "Capcom",                    genero: "Terror/Acción",        precioBase: 59.99, metacritic: 93 },
    { nombre: "Street Fighter 6",         desarrollador: "Capcom",                    genero: "Pelea",                precioBase: 59.99, metacritic: 92 },
    { nombre: "Diablo IV",                desarrollador: "Blizzard Entertainment",    genero: "RPG/Acción",           precioBase: 69.99, metacritic: 86 },
    { nombre: "Mortal Kombat 1",          desarrollador: "NetherRealm Studios",       genero: "Pelea",                precioBase: 69.99, metacritic: 82 },
    { nombre: "Forza Motorsport",         desarrollador: "Turn 10 Studios",           genero: "Carreras",             precioBase: 69.99, metacritic: 85 },
    { nombre: "EA Sports FC 24",          desarrollador: "EA Sports",                 genero: "Deportes",             precioBase: 69.99, metacritic: 79 },
    { nombre: "NBA 2K24",                 desarrollador: "Visual Concepts",           genero: "Deportes",             precioBase: 69.99, metacritic: 71 },
    { nombre: "Call of Duty: MW3",        desarrollador: "Sledgehammer Games",        genero: "Shooter/FPS",          precioBase: 69.99, metacritic: 56 },
    { nombre: "Helldivers 2",             desarrollador: "Arrowhead Game Studios",    genero: "Shooter/Coop",         precioBase: 39.99, metacritic: 82 },
    { nombre: "Palworld",                 desarrollador: "Pocketpair",                genero: "Aventura/Supervivencia",precioBase: 29.99, metacritic: 79 },
    { nombre: "Dave the Diver",           desarrollador: "MINTROCKET",                genero: "Indie/Aventura",       precioBase: 19.99, metacritic: 90 },
    { nombre: "Hades II",                 desarrollador: "Supergiant Games",          genero: "Indie/Roguelike",      precioBase: 29.99, metacritic: 91 },
    { nombre: "Hollow Knight: Silksong",  desarrollador: "Team Cherry",               genero: "Indie/Plataformas",    precioBase: 14.99, metacritic: 0  },
    { nombre: "Lies of P",                desarrollador: "NEOWIZ",                    genero: "Acción/RPG",           precioBase: 59.99, metacritic: 80 },
    { nombre: "Octopath Traveler II",     desarrollador: "Square Enix",              genero: "RPG/JRPG",             precioBase: 59.99, metacritic: 87 },
    { nombre: "Returnal",                 desarrollador: "Housemarque",               genero: "Shooter/Roguelike",    precioBase: 59.99, metacritic: 86 },
    { nombre: "Fortnite",                 desarrollador: "Epic Games",                genero: "Battle Royale",        precioBase: 0,     metacritic: 81 },
    { nombre: "Apex Legends",            desarrollador: "Respawn Entertainment",     genero: "Battle Royale",        precioBase: 0,     metacritic: 88 },
    { nombre: "Valorant",                 desarrollador: "Riot Games",                genero: "Shooter/Táctico",      precioBase: 0,     metacritic: 80 },
    { nombre: "League of Legends",        desarrollador: "Riot Games",                genero: "MOBA/Online",          precioBase: 0,     metacritic: 82 },
    { nombre: "World of Warcraft",        desarrollador: "Blizzard Entertainment",    genero: "MMORPG",               precioBase: 14.99, metacritic: 93 },
    { nombre: "Minecraft",                desarrollador: "Mojang Studios",            genero: "Sandbox/Aventura",     precioBase: 29.99, metacritic: 93 },
    { nombre: "GTA V",                    desarrollador: "Rockstar Games",            genero: "Acción/Mundo Abierto", precioBase: 29.99, metacritic: 97 },
    { nombre: "Red Dead Redemption 2",    desarrollador: "Rockstar Games",            genero: "Acción/Western",       precioBase: 59.99, metacritic: 97 },
    { nombre: "The Witcher 3",            desarrollador: "CD Projekt Red",            genero: "RPG/Aventura",         precioBase: 39.99, metacritic: 93 },
    { nombre: "Dark Souls III",           desarrollador: "FromSoftware",              genero: "Acción/RPG",           precioBase: 59.99, metacritic: 89 },
    { nombre: "Sekiro: Shadows Die Twice",desarrollador: "FromSoftware",              genero: "Acción/Aventura",      precioBase: 59.99, metacritic: 90 },
    { nombre: "Ghost of Tsushima",        desarrollador: "Sucker Punch Productions",  genero: "Acción/Aventura",      precioBase: 59.99, metacritic: 83 },
    { nombre: "Horizon Forbidden West",   desarrollador: "Guerrilla Games",           genero: "Acción/RPG",           precioBase: 69.99, metacritic: 88 },
    { nombre: "Death Stranding",          desarrollador: "Kojima Productions",        genero: "Acción/Aventura",      precioBase: 39.99, metacritic: 82 },
    { nombre: "Hades",                    desarrollador: "Supergiant Games",          genero: "Indie/Roguelike",      precioBase: 24.99, metacritic: 93 },
    { nombre: "Celeste",                  desarrollador: "Maddy Makes Games",         genero: "Indie/Plataformas",    precioBase: 19.99, metacritic: 94 },
    { nombre: "Disco Elysium",            desarrollador: "ZA/UM",                     genero: "RPG/Detective",        precioBase: 39.99, metacritic: 97 },
    { nombre: "Stardew Valley",           desarrollador: "ConcernedApe",              genero: "Simulación/RPG",       precioBase: 14.99, metacritic: 89 },
    { nombre: "Tekken 8",                 desarrollador: "Bandai Namco",              genero: "Pelea",                precioBase: 69.99, metacritic: 90 },
    { nombre: "Gran Turismo 7",           desarrollador: "Polyphony Digital",         genero: "Carreras/Simulación",  precioBase: 69.99, metacritic: 87 },
    { nombre: "Splatoon 3",              desarrollador: "Nintendo",                  genero: "Shooter/Online",       precioBase: 59.99, metacritic: 83 },
    { nombre: "Persona 5 Royal",          desarrollador: "Atlus",                     genero: "JRPG",                 precioBase: 59.99, metacritic: 95 },
    { nombre: "It Takes Two",             desarrollador: "Hazelight Studios",         genero: "Plataformas/Coop",     precioBase: 39.99, metacritic: 94 },
    { nombre: "Deathloop",                desarrollador: "Arkane Studios",            genero: "Shooter/Sigilo",       precioBase: 59.99, metacritic: 88 },
    { nombre: "The Last of Us Part I",   desarrollador: "Naughty Dog",               genero: "Acción/Terror",        precioBase: 69.99, metacritic: 89 },
    { nombre: "Uncharted 4",             desarrollador: "Naughty Dog",               genero: "Acción/Aventura",      precioBase: 39.99, metacritic: 93 },
    { nombre: "Monster Hunter Rise",      desarrollador: "Capcom",                    genero: "Acción/RPG",           precioBase: 39.99, metacritic: 88 },
    { nombre: "Devil May Cry 5",          desarrollador: "Capcom",                    genero: "Acción/Hack&Slash",    precioBase: 29.99, metacritic: 89 },
  ];

  // Géneros → categorías
  const generoACat = {
    "Acción": 0, "Aventura": 1, "RPG": 2, "Deportes": 3, "Estrategia": 4,
    "Terror": 5, "Simulación": 6, "Plataformas": 7, "Pelea": 8, "Shooter": 9,
    "Carreras": 10, "Indie": 11, "MMORPG": 12, "Battle Royale": 13, "Puzzles": 14,
  };

  function getCatId(genero) {
    for (const [key, idx] of Object.entries(generoACat)) {
      if (genero.includes(key)) return catIds[idx];
    }
    return catIds[0];
  }

  const prefijosExtra = [
    "Alpha ", "Neo ", "Ultra ", "Hyper ", "Super ", "Mega ", "Pro ",
    "Shadow ", "Dark ", "Neon ", "Turbo ", "Epic ", "Final ", "Omega ",
  ];
  const sufijosExtra = [
    " Remastered", " Ultimate", ": Origins", ": Legacy", " II", " III",
    " Zero", ": Reborn", " Chronicles", " Online", ": Redux", " Evolved",
  ];

  const juegosParaInsertar = [];
  const anioInicio = new Date(2015, 0, 1);
  const anioFin    = new Date(2024, 11, 31);

  // Juegos base reales
  for (const j of juegosBase) {
    const precio     = j.precioBase;
    const descuento  = Math.random() < 0.35 ? randInt(5, 70) : 0;
    const enOferta   = descuento > 0;
    const precioFinal = enOferta ? parseFloat((precio * (1 - descuento / 100)).toFixed(2)) : precio;
    juegosParaInsertar.push({
      nombre:          j.nombre,
      desarrollador:   j.desarrollador,
      genero:          j.genero,
      categoriaId:     getCatId(j.genero),
      plataformas:     randSubset(platIds, 1, 4),
      precio:          precioFinal,
      precioOriginal:  precio,
      descuento,
      enOferta,
      metacritic:      j.metacritic,
      likes:           randInt(500, 80000),
      ventas:          randInt(1000, 500000),
      stock:           randInt(0, 500),
      clasificacion:   randFrom(["E","E10+","T","M"]),
      multijugador:    Math.random() < 0.5,
      fechaLanzamiento:randDate(anioInicio, anioFin),
      calificacion:    0,
      numReseñas:      0,
      activo:          true,
      fechaCreacion:   new Date(),
    });
  }

  // Juegos generados (hasta 1050 total)
  const total = 1050;
  while (juegosParaInsertar.length < total) {
    const base      = randFrom(juegosBase);
    const variante  = Math.random() < 0.5
      ? randFrom(prefijosExtra) + base.nombre
      : base.nombre + randFrom(sufijosExtra);
    const precio    = randFloat(0, 79.99);
    const descuento = Math.random() < 0.3 ? randInt(5, 75) : 0;
    const enOferta  = descuento > 0;
    juegosParaInsertar.push({
      nombre:          variante,
      desarrollador:   base.desarrollador,
      genero:          base.genero,
      categoriaId:     getCatId(base.genero),
      plataformas:     randSubset(platIds, 1, 4),
      precio:          enOferta ? parseFloat((precio * (1 - descuento / 100)).toFixed(2)) : parseFloat(precio.toFixed(2)),
      precioOriginal:  parseFloat(precio.toFixed(2)),
      descuento,
      enOferta,
      metacritic:      randInt(40, 98),
      likes:           randInt(0, 100000),
      ventas:          randInt(0, 600000),
      stock:           randInt(0, 500),
      clasificacion:   randFrom(["E","E10+","T","M"]),
      multijugador:    Math.random() < 0.4,
      fechaLanzamiento:randDate(anioInicio, anioFin),
      calificacion:    0,
      numReseñas:      0,
      activo:          true,
      fechaCreacion:   new Date(),
    });
  }

  // Insertar en lotes
  for (let i = 0; i < juegosParaInsertar.length; i += 200) {
    await db.collection("juegos").insertMany(juegosParaInsertar.slice(i, i + 200));
  }
  console.log(`✅ ${juegosParaInsertar.length} juegos insertados`);

  // ─── 4. RESEÑAS ────────────────────────────────────────────────────────
  const todosLosJuegos = await db.collection("juegos").find({}, { projection: { _id: 1 } }).toArray();
  const comentariosPositivos = [
    "Una obra maestra absoluta. Cada detalle está cuidado al máximo.",
    "Increíble experiencia. Lo he jugado más de 100 horas y no me cansa.",
    "Gráficos espectaculares y jugabilidad fluida. Totalmente recomendado.",
    "La historia me atrapó desde el primer momento. Imprescindible.",
    "El mejor juego del año sin ninguna duda.",
  ];
  const comentariosMedios = [
    "Buen juego pero con algunos problemas técnicos al inicio.",
    "La historia es buena pero el gameplay puede ser repetitivo.",
    "Entretenido aunque no está al nivel de sus predecesores.",
    "Vale la pena jugarlo, especialmente si lo encuentras en oferta.",
  ];
  const comentariosNegativos = [
    "Demasiado corto para el precio que tiene. Decepcionante.",
    "Muchos bugs al lanzamiento. Necesita más parches.",
    "No cumplió mis expectativas. El marketing fue mejor que el juego.",
    "La IA enemiga es terrible. Ruina la experiencia.",
  ];
  const nombresUsuarios = [
    "GamerXtreme","NocturnePlayer","PixelHunter","ShadowRogue","StarForge",
    "VoidWalker","RetroKing","NeonBlade","IronFist","StormCaster",
    "LunarEcho","PhoenixRise","CyberWolf","ThunderStrike","MysticSage",
    "DragonSlayer","BlazeFury","IceBreaker","NightOwl","CodeBreaker",
    "ProGamer99","CasualPlayer","SpeedRunner","RPGLover","ActionJunkie",
  ];

  const resenasParaInsertar = [];
  const fechaInicio2 = new Date(2022, 0, 1);
  const fechaFin2    = new Date(2025, 2, 31);
  for (let i = 0; i < 1200; i++) {
    const juegoObj   = randFrom(todosLosJuegos);
    const puntuacion = randInt(1, 5);
    let comentario   = puntuacion >= 4 ? randFrom(comentariosPositivos) : puntuacion === 3 ? randFrom(comentariosMedios) : randFrom(comentariosNegativos);
    const sufijos    = ["", " Muy recomendado.", " ¡No te lo pierdas!", " Una pena.", " En oferta vale la pena.", " Esperaba más."];
    comentario += randFrom(sufijos);
    resenasParaInsertar.push({
      juegoId:       juegoObj._id,
      usuarioId:     null,
      usuarioNombre: randFrom(nombresUsuarios) + "_" + randInt(10, 99),
      esAnonimo:     true,
      puntuacion,
      comentario:    comentario.trim().substring(0, 500),
      fecha:         randDate(fechaInicio2, fechaFin2),
    });
  }
  for (let i = 0; i < resenasParaInsertar.length; i += 200) {
    await db.collection("resenas").insertMany(resenasParaInsertar.slice(i, i + 200));
  }
  console.log(`✅ ${resenasParaInsertar.length} reseñas insertadas`);

  // ─── Recalcular calificaciones ─────────────────────────────────────────
  const stats = await db.collection("resenas").aggregate([
    { $group: { _id: "$juegoId", promedio: { $avg: "$puntuacion" }, total: { $sum: 1 } } }
  ]).toArray();
  for (const s of stats) {
    await db.collection("juegos").updateOne(
      { _id: s._id },
      { $set: { calificacion: parseFloat(s.promedio.toFixed(1)), numReseñas: s.total } }
    );
  }
  console.log(`✅ Calificaciones actualizadas para ${stats.length} juegos`);

  // ─── Índices ───────────────────────────────────────────────────────────
  await db.collection("resenas").createIndex({ juegoId: 1 });
  await db.collection("resenas").createIndex({ fecha: -1 });

  console.log("\n📊 RESUMEN:");
  console.log(`   Categorías: ${await db.collection("categorias").countDocuments()}`);
  console.log(`   Plataformas: ${await db.collection("plataformas").countDocuments()}`);
  console.log(`   Juegos:      ${await db.collection("juegos").countDocuments()}`);
  console.log(`   Reseñas:     ${await db.collection("resenas").countDocuments()}`);
  console.log("\n🎮 Seed completado exitosamente.");

  await client.close();
}

seed().catch(err => { console.error("❌ Error:", err); process.exit(1); });
