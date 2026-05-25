/**
 * SEED SCRIPT - Tienda de Videojuegos (VERSIÓN CORREGIDA)
 * Cambios vs versión anterior:
 *   - categorias:    15 reales + 985 generadas = 1000+
 *   - plataformas:   8 reales + 992 generadas  = 1000+
 *   - juegos:        1050+ (sin cambios)
 *   - resenas:       1200+ (sin cambios)
 *   - transacciones: 1200 nuevas (colección extra con aggregate)
 */

const db = db.getSiblingDB("tienda_videojuegos");

// ─── Limpiar colecciones ───────────────────────────────────────────────────
db.categorias.drop();
db.plataformas.drop();
db.juegos.drop();
db.resenas.drop();
db.transacciones.drop();

print("🗑️  Colecciones eliminadas. Iniciando seed...");

// ─── Helpers ───────────────────────────────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec) { dec = dec || 2; return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }
function randSubset(arr, min, max) {
  var n = randInt(min, max);
  var shuffled = arr.slice().sort(function() { return 0.5 - Math.random(); });
  return shuffled.slice(0, n);
}

// ══════════════════════════════════════════════════════════════════════════
// 1. CATEGORÍAS — 15 reales + generadas hasta 1000
// ══════════════════════════════════════════════════════════════════════════
const categoriasBase = [
  { nombre: "Acción",        descripcion: "Juegos de acción frenética y combate intenso",        etiquetas: ["combate","velocidad","reflejos"],       icono: "⚔️",  popularidad: 95 },
  { nombre: "Aventura",      descripcion: "Exploración y narrativa profunda",                    etiquetas: ["historia","exploración","puzzles"],      icono: "🗺️",  popularidad: 88 },
  { nombre: "RPG",           descripcion: "Rol y desarrollo de personajes",                      etiquetas: ["personajes","historia","progresión"],    icono: "🧙",  popularidad: 92 },
  { nombre: "Deportes",      descripcion: "Simulación de deportes reales y ficticios",           etiquetas: ["competición","equipos","realismo"],      icono: "⚽",  popularidad: 78 },
  { nombre: "Estrategia",    descripcion: "Planificación táctica y gestión de recursos",         etiquetas: ["táctica","planificación","gestión"],     icono: "♟️",  popularidad: 72 },
  { nombre: "Terror",        descripcion: "Suspenso y horror psicológico",                       etiquetas: ["miedo","suspenso","horror"],             icono: "👻",  popularidad: 70 },
  { nombre: "Simulación",    descripcion: "Simuladores de vida, vuelo, conducción y más",        etiquetas: ["realismo","gestión","vida"],             icono: "🛫",  popularidad: 65 },
  { nombre: "Plataformas",   descripcion: "Saltos, obstáculos y niveles clásicos",               etiquetas: ["saltos","obstáculos","clásico"],         icono: "🍄",  popularidad: 80 },
  { nombre: "Pelea",         descripcion: "Combate uno a uno o en grupos",                       etiquetas: ["combate","1v1","torneo"],                icono: "🥊",  popularidad: 68 },
  { nombre: "Shooter",       descripcion: "Disparos en primera o tercera persona",               etiquetas: ["disparos","FPS","TPS"],                  icono: "🔫",  popularidad: 90 },
  { nombre: "Carreras",      descripcion: "Velocidad y competición en circuitos",                etiquetas: ["velocidad","coches","circuitos"],        icono: "🏎️",  popularidad: 73 },
  { nombre: "Indie",         descripcion: "Desarrolladores independientes y creativos",          etiquetas: ["independiente","creativo","innovador"],  icono: "🎨",  popularidad: 82 },
  { nombre: "MMORPG",        descripcion: "Rol masivo multijugador en línea",                    etiquetas: ["online","multijugador","mundo abierto"], icono: "🌐",  popularidad: 75 },
  { nombre: "Battle Royale", descripcion: "Supervivencia del más fuerte en partidas masivas",    etiquetas: ["supervivencia","masivo","competitivo"],  icono: "🏆",  popularidad: 87 },
  { nombre: "Puzzles",       descripcion: "Desafíos mentales y rompecabezas",                    etiquetas: ["lógica","desafío","mental"],             icono: "🧩",  popularidad: 60 },
];

// Datos para generar categorías adicionales
const adjetivos = [
  "Clásico","Moderno","Retro","Futurista","Táctico","Épico","Casual","Hardcore",
  "Competitivo","Cooperativo","Narrativo","Sandbox","Inmersivo","Arcade","Indie",
  "AAA","Mobile","VR","Online","Offline","Familiar","Oscuro","Fantástico","Histórico",
  "Cyberpunk","Post-apocalíptico","Medieval","Oriental","Occidental","Espacial"
];
const tiposJuego = [
  "Aventura","Acción","RPG","Estrategia","Simulación","Terror","Deportes",
  "Plataformas","Shooter","Carreras","Puzzles","Gestión","Mundo Abierto",
  "Sigilo","Supervivencia","Tower Defense","MOBA","Battle Royale","Roguelike",
  "Metroidvania","Visual Novel","Hack and Slash","Point and Click","RTS","TBS"
];
const iconosExtra = ["🎯","🛡️","🌍","🔮","🎲","💎","🚀","🌊","🔥","❄️","⚡","🌙","☀️","🎭","🗡️"];

const categoriasParaInsertar = categoriasBase.map(function(c) {
  return Object.assign({}, c, { fechaCreacion: new Date(), activo: true });
});

// Generar hasta 1000 categorías adicionales (combinaciones únicas)
var catNombresUsados = {};
categoriasBase.forEach(function(c) { catNombresUsados[c.nombre] = true; });

var intentos = 0;
while (categoriasParaInsertar.length < 1000 && intentos < 50000) {
  intentos++;
  var adj = randFrom(adjetivos);
  var tipo = randFrom(tiposJuego);
  var nombre = adj + " " + tipo;
  if (catNombresUsados[nombre]) continue;
  catNombresUsados[nombre] = true;
  categoriasParaInsertar.push({
    nombre: nombre,
    descripcion: "Subcategoría especializada en " + nombre.toLowerCase() + " para todo tipo de jugadores.",
    etiquetas: randSubset([adj.toLowerCase(), tipo.toLowerCase(), "videojuego", "entretenimiento", "gaming"], 2, 4),
    icono: randFrom(iconosExtra),
    popularidad: randInt(10, 99),
    fechaCreacion: randDate(new Date(2010,0,1), new Date(2024,11,31)),
    activo: Math.random() > 0.1,
  });
}

var catInsert = db.categorias.insertMany(categoriasParaInsertar);
var catIds = catInsert.insertedIds;
var catKeys = Object.keys(catIds);
print("✅ " + catKeys.length + " categorías insertadas");

// ══════════════════════════════════════════════════════════════════════════
// 2. PLATAFORMAS — 8 reales + generadas hasta 1000
// ══════════════════════════════════════════════════════════════════════════
const plataformasBase = [
  { nombre: "PlayStation 5",   fabricante: "Sony",      tipo: "Consola",     anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2",         ram: "16GB GDDR6",  almacenamiento: "825GB SSD"  }, precio_consola: 499.99, activa: true  },
  { nombre: "Xbox Series X",   fabricante: "Microsoft", tipo: "Consola",     anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2 12TF",    ram: "16GB GDDR6",  almacenamiento: "1TB SSD"    }, precio_consola: 499.99, activa: true  },
  { nombre: "Nintendo Switch", fabricante: "Nintendo",  tipo: "Híbrida",     anioLanzamiento: 2017, especificaciones: { cpu: "NVIDIA Tegra X1+", gpu: "Maxwell",            ram: "4GB LPDDR4",  almacenamiento: "32GB eMMC"  }, precio_consola: 299.99, activa: true  },
  { nombre: "PC",              fabricante: "Varios",    tipo: "Computadora", anioLanzamiento: 1980, especificaciones: { cpu: "Variable",          gpu: "Variable",           ram: "Variable",    almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
  { nombre: "PlayStation 4",   fabricante: "Sony",      tipo: "Consola",     anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.84TF",     ram: "8GB GDDR5",   almacenamiento: "500GB HDD"  }, precio_consola: 299.99, activa: false },
  { nombre: "Xbox One",        fabricante: "Microsoft", tipo: "Consola",     anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.4TF",      ram: "8GB DDR3",    almacenamiento: "500GB HDD"  }, precio_consola: 249.99, activa: false },
  { nombre: "iOS",             fabricante: "Apple",     tipo: "Móvil",       anioLanzamiento: 2007, especificaciones: { cpu: "Apple Silicon",     gpu: "Apple GPU",          ram: "Variable",    almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
  { nombre: "Android",         fabricante: "Google",    tipo: "Móvil",       anioLanzamiento: 2008, especificaciones: { cpu: "Variable ARM",      gpu: "Variable",           ram: "Variable",    almacenamiento: "Variable"   }, precio_consola: null,   activa: true  },
];

const fabricantesExtra = [
  "Atari","Sega","NEC","SNK","Bandai","Casio","Philips","Coleco","Mattel","Tiger",
  "Commodore","Amstrad","Sinclair","Tandy","TurboGrafx","3DO","Panasonic","Amiga",
  "Epoch","Watara","Gakken","Entex","Grandstand","Milton Bradley","Parker Brothers",
  "Emerson","Fairchild","Bally","Magnavox","RCA","General Instrument","Telstar","Pong"
];
const tiposPlataforma = ["Consola","Portátil","Híbrida","Arcade","Computadora","Móvil","Smart TV","VR","Handheld","Mini Consola"];
const arquitecturas = ["x86-64","ARM","MIPS","PowerPC","68000","Z80","6502","RISC-V","SPARC","Alpha"];

const plataformasParaInsertar = plataformasBase.map(function(p) {
  return Object.assign({}, p, { fechaRegistro: new Date() });
});

var platNombresUsados = {};
plataformasBase.forEach(function(p) { platNombresUsados[p.nombre] = true; });

var platIntents = 0;
var generacion = 1;
while (plataformasParaInsertar.length < 1000 && platIntents < 100000) {
  platIntents++;
  var fab = randFrom(fabricantesExtra);
  var tipo = randFrom(tiposPlataforma);
  var anio = randInt(1972, 2024);
  var gen = randInt(1, 9);
  var nombre = fab + " " + tipo + " Gen" + gen + " (" + anio + ")";

  if (platNombresUsados[nombre]) continue;
  platNombresUsados[nombre] = true;

  var ramOpts = ["512KB","1MB","4MB","8MB","16MB","32MB","64MB","128MB","256MB","512MB","1GB","2GB","4GB","8GB","16GB"];
  var storOpts = ["No incluido","4MB","8MB","16MB","32MB","64MB","128MB","256MB","512MB","1GB","4GB","8GB","16GB","32GB","64GB","128GB","256GB","512GB","1TB"];

  plataformasParaInsertar.push({
    nombre: nombre,
    fabricante: fab,
    tipo: tipo,
    anioLanzamiento: anio,
    especificaciones: {
      cpu: randFrom(arquitecturas) + " " + randFloat(0.5, 4.0, 1) + "GHz",
      gpu: "Integrada " + randInt(64, 2048) + "GFLOPS",
      ram: randFrom(ramOpts),
      almacenamiento: randFrom(storOpts),
    },
    precio_consola: Math.random() > 0.2 ? randFloat(29.99, 599.99) : null,
    activa: anio >= 2010 ? Math.random() > 0.3 : Math.random() > 0.8,
    generacion: gen,
    unidadesVendidas: randInt(10000, 180000000),
    fechaRegistro: new Date(),
  });
}

var platInsert = db.plataformas.insertMany(plataformasParaInsertar);
var platIds = platInsert.insertedIds;
var platKeys = Object.keys(platIds);
print("✅ " + platKeys.length + " plataformas insertadas");

// Mapear las 8 plataformas reales (por índice) para usarlas en juegos
var plataformasPorJuego = {
  "PlayStation 5":   platIds[0],
  "Xbox Series X":   platIds[1],
  "Nintendo Switch": platIds[2],
  "PC":              platIds[3],
  "PlayStation 4":   platIds[4],
  "Xbox One":        platIds[5],
  "iOS":             platIds[6],
  "Android":         platIds[7],
};

// ══════════════════════════════════════════════════════════════════════════
// 3. JUEGOS — 1050+ documentos (sin cambios en lógica)
// ══════════════════════════════════════════════════════════════════════════
const juegosBase = [
  { nombre: "Black Myth: Wukong",          desarrollador: "Game Science",           genero: "Acción/RPG",      precioBase: 59.99, metacritic: 82 },
  { nombre: "Astro Bot",                   desarrollador: "Team Asobi",             genero: "Plataformas",     precioBase: 59.99, metacritic: 94 },
  { nombre: "Elden Ring",                  desarrollador: "FromSoftware",           genero: "RPG/Acción",      precioBase: 59.99, metacritic: 96 },
  { nombre: "God of War Ragnarök",         desarrollador: "Santa Monica Studio",    genero: "Acción/Aventura", precioBase: 69.99, metacritic: 94 },
  { nombre: "Hogwarts Legacy",             desarrollador: "Avalanche Software",     genero: "RPG/Aventura",    precioBase: 59.99, metacritic: 84 },
  { nombre: "Cyberpunk 2077",              desarrollador: "CD Projekt Red",         genero: "RPG/Acción",      precioBase: 59.99, metacritic: 86 },
  { nombre: "The Last of Us Part II",      desarrollador: "Naughty Dog",            genero: "Aventura/Acción", precioBase: 59.99, metacritic: 93 },
  { nombre: "Baldur's Gate 3",             desarrollador: "Larian Studios",         genero: "RPG",             precioBase: 69.99, metacritic: 96 },
  { nombre: "Red Dead Redemption 2",       desarrollador: "Rockstar Games",         genero: "Aventura/Acción", precioBase: 59.99, metacritic: 97 },
  { nombre: "The Witcher 3",               desarrollador: "CD Projekt Red",         genero: "RPG",             precioBase: 39.99, metacritic: 93 },
  { nombre: "Hades",                       desarrollador: "Supergiant Games",       genero: "Indie/RPG",       precioBase: 24.99, metacritic: 93 },
  { nombre: "Hollow Knight",               desarrollador: "Team Cherry",            genero: "Indie/Plataformas",precioBase: 14.99, metacritic: 90 },
  { nombre: "Celeste",                     desarrollador: "Maddy Makes Games",      genero: "Indie/Plataformas",precioBase: 19.99, metacritic: 94 },
  { nombre: "Disco Elysium",               desarrollador: "ZA/UM",                  genero: "RPG/Aventura",    precioBase: 39.99, metacritic: 97 },
  { nombre: "Resident Evil Village",       desarrollador: "Capcom",                 genero: "Terror/Acción",   precioBase: 59.99, metacritic: 84 },
  { nombre: "Horizon Forbidden West",      desarrollador: "Guerrilla Games",        genero: "Aventura/Acción", precioBase: 69.99, metacritic: 88 },
  { nombre: "Spider-Man: Miles Morales",   desarrollador: "Insomniac Games",        genero: "Acción/Aventura", precioBase: 49.99, metacritic: 85 },
  { nombre: "Ghost of Tsushima",           desarrollador: "Sucker Punch",           genero: "Aventura/Acción", precioBase: 59.99, metacritic: 83 },
  { nombre: "Forza Horizon 5",             desarrollador: "Playground Games",       genero: "Carreras",        precioBase: 59.99, metacritic: 92 },
  { nombre: "Halo Infinite",               desarrollador: "343 Industries",         genero: "Shooter",         precioBase: 59.99, metacritic: 87 },
  { nombre: "Deathloop",                   desarrollador: "Arkane Lyon",            genero: "Shooter/Acción",  precioBase: 59.99, metacritic: 88 },
  { nombre: "Returnal",                    desarrollador: "Housemarque",            genero: "Shooter/Roguelike",precioBase: 59.99, metacritic: 86 },
  { nombre: "Ratchet & Clank: Rift Apart", desarrollador: "Insomniac Games",        genero: "Plataformas/Acción",precioBase: 69.99, metacritic: 88 },
  { nombre: "Demon's Souls",               desarrollador: "Bluepoint Games",        genero: "RPG/Acción",      precioBase: 69.99, metacritic: 92 },
  { nombre: "Final Fantasy XVI",           desarrollador: "Square Enix",            genero: "RPG/Acción",      precioBase: 69.99, metacritic: 87 },
  { nombre: "Street Fighter 6",            desarrollador: "Capcom",                 genero: "Pelea",           precioBase: 59.99, metacritic: 92 },
  { nombre: "Tekken 8",                    desarrollador: "Bandai Namco",           genero: "Pelea",           precioBase: 59.99, metacritic: 90 },
  { nombre: "FIFA 24",                     desarrollador: "EA Sports",              genero: "Deportes",        precioBase: 69.99, metacritic: 75 },
  { nombre: "NBA 2K24",                    desarrollador: "Visual Concepts",        genero: "Deportes",        precioBase: 69.99, metacritic: 70 },
  { nombre: "Stardew Valley",              desarrollador: "ConcernedApe",           genero: "Simulación/Indie",precioBase: 14.99, metacritic: 89 },
  { nombre: "Among Us",                    desarrollador: "Innersloth",             genero: "Indie/Multijugador",precioBase: 4.99, metacritic: 85 },
  { nombre: "Fall Guys",                   desarrollador: "Mediatonic",             genero: "Battle Royale",   precioBase: 19.99, metacritic: 80 },
  { nombre: "Apex Legends",               desarrollador: "Respawn Entertainment",  genero: "Battle Royale",   precioBase: 0,     metacritic: 89 },
  { nombre: "Valorant",                    desarrollador: "Riot Games",             genero: "Shooter",         precioBase: 0,     metacritic: 80 },
  { nombre: "League of Legends",           desarrollador: "Riot Games",             genero: "MMORPG",          precioBase: 0,     metacritic: 78 },
  { nombre: "Minecraft",                   desarrollador: "Mojang",                 genero: "Simulación/Sandbox",precioBase: 26.99,metacritic: 93 },
  { nombre: "Terraria",                    desarrollador: "Re-Logic",               genero: "Indie/Sandbox",   precioBase: 9.99,  metacritic: 85 },
  { nombre: "Portal 2",                    desarrollador: "Valve",                  genero: "Puzzles",         precioBase: 9.99,  metacritic: 95 },
  { nombre: "Half-Life: Alyx",             desarrollador: "Valve",                  genero: "Shooter/VR",      precioBase: 59.99, metacritic: 93 },
  { nombre: "Death Stranding",             desarrollador: "Kojima Productions",     genero: "Aventura/Acción", precioBase: 39.99, metacritic: 82 },
  { nombre: "Control",                     desarrollador: "Remedy Entertainment",   genero: "Acción/Aventura", precioBase: 39.99, metacritic: 82 },
  { nombre: "Sekiro: Shadows Die Twice",   desarrollador: "FromSoftware",           genero: "Acción/RPG",      precioBase: 59.99, metacritic: 90 },
  { nombre: "Dark Souls III",              desarrollador: "FromSoftware",           genero: "RPG/Acción",      precioBase: 39.99, metacritic: 89 },
  { nombre: "Bloodborne",                  desarrollador: "FromSoftware",           genero: "RPG/Acción",      precioBase: 29.99, metacritic: 92 },
  { nombre: "Monster Hunter World",        desarrollador: "Capcom",                 genero: "RPG/Acción",      precioBase: 29.99, metacritic: 90 },
  { nombre: "Dragon's Dogma 2",            desarrollador: "Capcom",                 genero: "RPG/Acción",      precioBase: 69.99, metacritic: 87 },
  { nombre: "Alan Wake 2",                 desarrollador: "Remedy Entertainment",   genero: "Terror/Aventura", precioBase: 59.99, metacritic: 89 },
  { nombre: "Starfield",                   desarrollador: "Bethesda",               genero: "RPG/Acción",      precioBase: 69.99, metacritic: 83 },
  { nombre: "Diablo IV",                   desarrollador: "Blizzard Entertainment", genero: "RPG/Acción",      precioBase: 69.99, metacritic: 86 },
  { nombre: "Lies of P",                   desarrollador: "Round8 Studio",          genero: "RPG/Acción",      precioBase: 59.99, metacritic: 80 },
];

const combosPlataforma = [
  ["PC","PlayStation 5","Xbox Series X"],
  ["PC","PlayStation 5"],
  ["PC","Xbox Series X"],
  ["PlayStation 5","Xbox Series X"],
  ["PC"],
  ["Nintendo Switch"],
  ["PC","Nintendo Switch"],
  ["PlayStation 5","Xbox Series X","Nintendo Switch","PC"],
  ["iOS","Android"],
  ["PC","iOS","Android"],
];

const edades    = ["E","E10+","T","M","AO"];
const idiomas   = ["Español","Inglés","Francés","Alemán","Japonés","Portugués","Italiano"];
const modos     = ["Un jugador","Multijugador local","Multijugador online","Cooperativo","PvP"];
const imagenes  = [
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co5q97.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ekt.jpg",
];

// Mapear género → índice de categoría (usa las 15 primeras = las reales)
var catMap0 = {
  "Acción":0,"Aventura":1,"RPG":2,"Deportes":3,"Estrategia":4,
  "Terror":5,"Simulación":6,"Plataformas":7,"Pelea":8,"Shooter":9,
  "Carreras":10,"Indie":11,"MMORPG":12,"Battle Royale":13,"Puzzles":14,
};
function getCategoriaId(genero) {
  var key = Object.keys(catMap0).find(function(k) { return genero.indexOf(k) !== -1; });
  return key !== undefined ? catIds[catMap0[key]] : catIds[0];
}

const juegosParaInsertar = [];
var contador = 0;

// Insertar juegos base
for (var i = 0; i < juegosBase.length; i++) {
  var base = juegosBase[i];
  var combo = randFrom(combosPlataforma);
  var platsIds = combo.map(function(p) { return plataformasPorJuego[p]; }).filter(Boolean);
  var descuento = Math.random() > 0.6 ? randInt(5,50) : 0;
  var precioFinal = parseFloat((base.precioBase * (1 - descuento/100)).toFixed(2));

  juegosParaInsertar.push({
    nombre: base.nombre, desarrollador: base.desarrollador, genero: base.genero,
    categoriaId: getCategoriaId(base.genero), plataformas: platsIds,
    precio: precioFinal, precioOriginal: base.precioBase, descuento: descuento, enOferta: descuento > 0,
    metacritic: base.metacritic,
    url: "https://www.eneba.com/latam/" + base.nombre.toLowerCase().replace(/[^a-z0-9]/g,"-"),
    imagen: randFrom(imagenes), likes: randInt(100,98000), ventas: randInt(50,500000),
    stock: randInt(0,9999), calificacion: randFloat(1,5,1), numReseñas: randInt(10,50000),
    idiomas: randSubset(idiomas,2,5), modos: randSubset(modos,1,3),
    clasificacion: randFrom(edades),
    fechaLanzamiento: randDate(new Date(2015,0,1), new Date(2024,11,31)),
    fechaRegistro: new Date(), destacado: Math.random()>0.8, dlc: Math.random()>0.7,
    multijugador: base.genero.indexOf("Online")!==-1||base.genero.indexOf("Battle")!==-1||base.genero.indexOf("MOBA")!==-1,
    requisitos: {
      minimos:      { so:"Windows 10 64-bit", procesador:"Intel Core i5-8400 / AMD Ryzen 5 2600", memoria: randFrom([8,12,16])+"GB RAM", grafica:"NVIDIA GTX 1060 6GB / AMD RX 580",      almacenamiento:randInt(20,150)+"GB"     },
      recomendados: { so:"Windows 11 64-bit", procesador:"Intel Core i7-12700K / AMD Ryzen 7 5800X",memoria:randFrom([16,32])+"GB RAM",  grafica:"NVIDIA RTX 3080 / AMD RX 6800 XT",    almacenamiento:randInt(50,200)+"GB SSD" }
    },
    reseñasDestacadas: [
      { usuario:"user_"+randInt(1000,9999), puntuacion:randInt(3,5), comentario:"Excelente juego, lo recomiendo.", fecha:randDate(new Date(2023,0,1),new Date(2024,11,31)) },
      { usuario:"user_"+randInt(1000,9999), puntuacion:randInt(1,5), comentario:"Buena experiencia en general.",   fecha:randDate(new Date(2023,0,1),new Date(2024,11,31)) },
    ]
  });
  contador++;
}

// Generar variantes hasta 1050
const sufijos = ["Edición Deluxe","GOTY Edition","Complete Edition","Remastered","Director's Cut","Enhanced Edition","Ultimate Edition","Gold Edition","Digital Deluxe","Anniversary"];
const prefijosExtra = ["Super ","Mega ","Ultra ","Neo ","Hyper ","Alpha ","Final ","Extreme ","Pro "];
const desarrolladoresExtra = ["Ubisoft","EA Games","Activision","Konami","Sega","Namco","2K Games","THQ Nordic","Focus Entertainment","Nacon","505 Games","Team17","Devolver Digital","Annapurna Interactive","Raw Fury","Humble Games"];
const generosExtra = ["Acción","Aventura","RPG","Deportes","Estrategia","Terror","Simulación","Plataformas","Pelea","Shooter","Carreras","Indie","Puzzles"];

while (contador < 1050) {
  var base2 = randFrom(juegosBase);
  var esVariante = Math.random() > 0.5;
  var nombre2 = esVariante ? base2.nombre+" - "+randFrom(sufijos) : randFrom(prefijosExtra)+base2.nombre.split(":")[0];
  var combo2 = randFrom(combosPlataforma);
  var platsIds2 = combo2.map(function(p){ return plataformasPorJuego[p]; }).filter(Boolean);
  var precioBase2 = randFloat(4.99,79.99);
  var desc2 = Math.random()>0.5 ? randInt(5,70) : 0;
  var precioFinal2 = parseFloat((precioBase2*(1-desc2/100)).toFixed(2));
  var genero2 = randFrom(generosExtra);

  juegosParaInsertar.push({
    nombre: nombre2,
    desarrollador: Math.random()>0.5 ? base2.desarrollador : randFrom(desarrolladoresExtra),
    genero: genero2, categoriaId: getCategoriaId(genero2), plataformas: platsIds2,
    precio: precioFinal2, precioOriginal: precioBase2, descuento: desc2, enOferta: desc2>0,
    metacritic: randInt(50,99),
    url: "https://www.eneba.com/latam/"+nombre2.toLowerCase().replace(/[^a-z0-9]/g,"-"),
    imagen: randFrom(imagenes), likes: randInt(10,50000), ventas: randInt(10,200000),
    stock: randInt(0,9999), calificacion: randFloat(1,5,1), numReseñas: randInt(5,20000),
    idiomas: randSubset(idiomas,1,4), modos: randSubset(modos,1,3),
    clasificacion: randFrom(edades),
    fechaLanzamiento: randDate(new Date(2010,0,1), new Date(2024,11,31)),
    fechaRegistro: new Date(), destacado: Math.random()>0.85, dlc: Math.random()>0.75,
    multijugador: Math.random()>0.6,
    requisitos: {
      minimos:      { so:"Windows 10 64-bit", procesador:"Intel Core i5 / AMD Ryzen 5", memoria:randFrom([8,16])+"GB RAM",  grafica:"NVIDIA GTX 970 / AMD RX 480",     almacenamiento:randInt(10,100)+"GB"     },
      recomendados: { so:"Windows 11 64-bit", procesador:"Intel Core i7 / AMD Ryzen 7", memoria:randFrom([16,32])+"GB RAM", grafica:"NVIDIA RTX 2080 / AMD RX 6700 XT",almacenamiento:randInt(30,150)+"GB SSD" }
    },
    reseñasDestacadas: [{ usuario:"user_"+randInt(1000,9999), puntuacion:randInt(1,5), comentario:"Muy entretenido.", fecha:new Date() }]
  });
  contador++;
}

var LOTE = 200; var insertados = 0;
for (var i = 0; i < juegosParaInsertar.length; i += LOTE) {
  db.juegos.insertMany(juegosParaInsertar.slice(i, i+LOTE));
  insertados += Math.min(LOTE, juegosParaInsertar.length - i);
}
print("✅ "+insertados+" juegos insertados");

// Índices juegos
db.juegos.createIndex({ nombre:"text", desarrollador:"text" }, { name:"idx_texto_busqueda" });
db.juegos.createIndex({ categoriaId:1 });
db.juegos.createIndex({ precio:1 });
db.juegos.createIndex({ metacritic:-1 });
db.juegos.createIndex({ likes:-1 });
db.juegos.createIndex({ fechaLanzamiento:-1 });
db.juegos.createIndex({ enOferta:1, descuento:-1 });
db.categorias.createIndex({ nombre:1 }, { unique:true });
db.plataformas.createIndex({ nombre:1 }, { unique:true });
print("✅ Índices juegos/categorias/plataformas creados");

// ══════════════════════════════════════════════════════════════════════════
// 4. RESEÑAS — 1200 documentos
// ══════════════════════════════════════════════════════════════════════════
var todosLosJuegos = db.juegos.find({},{_id:1}).toArray();
var totalJuegosDisp = todosLosJuegos.length;

const comentariosPositivos = [
  "Absolutamente increíble, una obra maestra del género.",
  "La jugabilidad es fluida y muy satisfactoria.",
  "Gráficos espectaculares y una historia que engancha desde el principio.",
  "Muy recomendado, horas y horas de entretenimiento garantizado.",
  "Una experiencia única que no olvidarás fácilmente.",
  "El mejor juego que he jugado en años, vale cada peso.",
  "Perfecto en todos los aspectos: audio, gráficos y jugabilidad.",
  "Narrativa profunda con personajes bien desarrollados.",
  "Supera todas las expectativas, un juego de culto.",
  "Cada partida es diferente, tiene una rejugabilidad brutal.",
];
const comentariosMedios = [
  "Buen juego aunque le faltan algunos ajustes de equilibrio.",
  "Historia interesante pero el gameplay puede volverse repetitivo.",
  "Cumple lo que promete, aunque no reinventa el género.",
  "Disfrutable pero con algunos bugs menores que molestan.",
  "Buena base pero le faltó más contenido en el modo historia.",
  "Entretenido para pasar el rato, no es para todos los públicos.",
  "Tiene sus momentos brillantes pero también sus altibajos.",
  "El multijugador salva un modo campaña algo flojo.",
  "Visualmente bonito pero la IA enemiga deja mucho que desear.",
  "Prometedor aunque aún necesita pulido.",
];
const comentariosNegativos = [
  "Mucho hype para lo que ofrece realmente.",
  "Lleno de microtransacciones que arruinan la experiencia.",
  "Los servidores son un desastre, imposible jugar online.",
  "Historia predecible y personajes sin carisma.",
  "No merece el precio que piden, espera una rebaja.",
  "Demasiados bugs en el lanzamiento, lo abandoné rápido.",
  "Las mecánicas se sienten anticuadas comparado con la competencia.",
  "El tutorial es inexistente, curva de aprendizaje brutal.",
];
const sufijosResena = ["","Muy recomendado."," Lo volveré a jugar."," ¡No te lo pierdas!"," Una pena."," En oferta vale la pena."," Esperaba más."," Gran trabajo del equipo."];
const nombresUsuarios = ["GamerXtreme","NocturnePlayer","PixelHunter","ShadowRogue","StarForge","VoidWalker","CryptoNinja","RetroKing","NeonBlade","IronFist","StormCaster","DarkMatter","LunarEcho","PhoenixRise","CyberWolf","ThunderStrike","MysticSage","SilverArrow","GhostRider","ArcLight","DragonSlayer","RuneKeeper","BlazeFury","IceBreaker","VortexOne","NightOwl","SteelHeart","WildCard","CodeBreaker","LegendKiller","ProGamer99","CasualPlayer","HardcoreElite","SpeedRunner","Completionist","RPGLover","StrategyMind","ActionJunkie","HorrorFan","RacingAce","user_4521","user_7832","user_1193","user_6647","user_3315","user_9002","user_5578","user_2241","user_8864","user_4409"];

const resenasParaInsertar = [];
var fechaInicioR = new Date(2022,0,1);
var fechaFinR    = new Date(2025,2,31);

for (var i = 0; i < 1200; i++) {
  var juegoObj  = todosLosJuegos[Math.floor(Math.random()*totalJuegosDisp)];
  var puntuacion = randInt(1,5);
  var comentario;
  if      (puntuacion >= 4) comentario = randFrom(comentariosPositivos);
  else if (puntuacion === 3) comentario = randFrom(comentariosMedios);
  else                       comentario = randFrom(comentariosNegativos);
  comentario = (comentario + " " + randFrom(sufijosResena)).trim().substring(0,500);

  resenasParaInsertar.push({
    juegoId:       juegoObj._id,
    usuarioId:     null,
    usuarioNombre: randFrom(nombresUsuarios)+"_"+randInt(10,99),
    esAnonimo:     true,
    puntuacion:    puntuacion,
    comentario:    comentario,
    fecha:         randDate(fechaInicioR, fechaFinR),
  });
}

var resenasInsertadas = 0;
for (var i = 0; i < resenasParaInsertar.length; i += 200) {
  db.resenas.insertMany(resenasParaInsertar.slice(i,i+200));
  resenasInsertadas += Math.min(200, resenasParaInsertar.length-i);
}
print("✅ "+resenasInsertadas+" reseñas insertadas");

db.resenas.createIndex({ juegoId:1 });
db.resenas.createIndex({ fecha:-1 });
db.resenas.createIndex({ puntuacion:1 });
print("✅ Índices resenas creados");

// Recalcular calificaciones
var statsResenas = db.resenas.aggregate([
  { $group: { _id:"$juegoId", promedio:{ $avg:"$puntuacion" }, total:{ $sum:1 } } }
]).toArray();
statsResenas.forEach(function(s) {
  db.juegos.updateOne({ _id:s._id }, { $set:{ calificacion:parseFloat(s.promedio.toFixed(1)), numReseñas:s.total } });
});
print("✅ Calificaciones actualizadas para "+statsResenas.length+" juegos");

// ══════════════════════════════════════════════════════════════════════════
// 5. TRANSACCIONES — colección nueva, 1200 documentos
//    Modela compras realizadas en la tienda
//    Tiene aggregate propio en server.js: /api/stats/transacciones
// ══════════════════════════════════════════════════════════════════════════
var todosJuegosConPrecio = db.juegos.find({},{_id:1,precio:1,categoriaId:1}).toArray();
var totalJuegosT = todosJuegosConPrecio.length;

const metodospago = ["Tarjeta Crédito","Tarjeta Débito","PayPal","PSN Wallet","Xbox Wallet","Nintendo eShop","Criptomoneda","Transferencia Bancaria","Nequi","Daviplata"];
const paises      = ["Colombia","México","Argentina","Chile","Perú","Venezuela","Ecuador","Bolivia","Paraguay","Uruguay","España","Brasil"];
const estadosTx   = ["completada","completada","completada","completada","pendiente","reembolsada","cancelada"];

const transaccionesParaInsertar = [];
var fechaTxInicio = new Date(2022,0,1);
var fechaTxFin    = new Date(2025,3,30);

for (var i = 0; i < 1200; i++) {
  var juegoTx = todosJuegosConPrecio[Math.floor(Math.random()*totalJuegosT)];
  var cantidad = randInt(1,3);
  var precioUnit = juegoTx.precio || randFloat(4.99,69.99);
  var subtotal = parseFloat((precioUnit * cantidad).toFixed(2));
  var descuentoTx = Math.random() > 0.7 ? randInt(5,30) : 0;
  var total = parseFloat((subtotal * (1 - descuentoTx/100)).toFixed(2));
  var fechaTx = randDate(fechaTxInicio, fechaTxFin);

  transaccionesParaInsertar.push({
    juegoId:      juegoTx._id,
    categoriaId:  juegoTx.categoriaId,
    cantidad:     cantidad,
    precioUnitario: precioUnit,
    descuento:    descuentoTx,
    subtotal:     subtotal,
    total:        total,
    metodoPago:   randFrom(metodospago),
    pais:         randFrom(paises),
    estado:       randFrom(estadosTx),
    fecha:        fechaTx,
    anio:         fechaTx.getFullYear(),
    mes:          fechaTx.getMonth()+1,
    usuarioNombre: "user_"+randInt(1000,9999),
  });
}

var txInsertadas = 0;
for (var i = 0; i < transaccionesParaInsertar.length; i += 200) {
  db.transacciones.insertMany(transaccionesParaInsertar.slice(i,i+200));
  txInsertadas += Math.min(200, transaccionesParaInsertar.length-i);
}
print("✅ "+txInsertadas+" transacciones insertadas");

db.transacciones.createIndex({ juegoId:1 });
db.transacciones.createIndex({ fecha:-1 });
db.transacciones.createIndex({ estado:1 });
db.transacciones.createIndex({ pais:1 });
db.transacciones.createIndex({ anio:1, mes:1 });
print("✅ Índices transacciones creados");

// ─── Verificación final ────────────────────────────────────────────────────
print("\n📊 RESUMEN FINAL:");
print("   Categorías:    "+db.categorias.countDocuments());
print("   Plataformas:   "+db.plataformas.countDocuments());
print("   Juegos:        "+db.juegos.countDocuments());
print("   Reseñas:       "+db.resenas.countDocuments());
print("   Transacciones: "+db.transacciones.countDocuments());
print("\n🎮 Seed completado exitosamente.");
