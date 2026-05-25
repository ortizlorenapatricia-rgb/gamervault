/**
 * SEED SCRIPT - Tienda de Videojuegos
 * Genera 1000+ documentos en colecciones: categorias, plataformas, juegos
 * Uso: mongosh mongodb://localhost:27017/tienda_videojuegos seed.js
 */

const db = db.getSiblingDB("tienda_videojuegos");

// ─── Limpiar colecciones ───────────────────────────────────────────────────
db.categorias.drop();
db.plataformas.drop();
db.juegos.drop();

print("🗑️  Colecciones eliminadas. Iniciando seed...");

// ─── 1. CATEGORÍAS (con subdocumento embebido: etiquetas) ──────────────────
const categoriasData = [
  { nombre: "Acción",         descripcion: "Juegos de acción frenética y combate intenso",       etiquetas: ["combate", "velocidad", "reflejos"],      icono: "⚔️",  popularidad: 95 },
  { nombre: "Aventura",       descripcion: "Exploración y narrativa profunda",                   etiquetas: ["historia", "exploración", "puzzles"],     icono: "🗺️",  popularidad: 88 },
  { nombre: "RPG",            descripcion: "Rol y desarrollo de personajes",                     etiquetas: ["personajes", "historia", "progresión"],   icono: "🧙",  popularidad: 92 },
  { nombre: "Deportes",       descripcion: "Simulación de deportes reales y ficticios",          etiquetas: ["competición", "equipos", "realismo"],     icono: "⚽",  popularidad: 78 },
  { nombre: "Estrategia",     descripcion: "Planificación táctica y gestión de recursos",        etiquetas: ["táctica", "planificación", "gestión"],    icono: "♟️",  popularidad: 72 },
  { nombre: "Terror",         descripcion: "Suspenso y horror psicológico",                      etiquetas: ["miedo", "suspenso", "horror"],            icono: "👻",  popularidad: 70 },
  { nombre: "Simulación",     descripcion: "Simuladores de vida, vuelo, conducción y más",       etiquetas: ["realismo", "gestión", "vida"],            icono: "🛫",  popularidad: 65 },
  { nombre: "Plataformas",    descripcion: "Saltos, obstáculos y niveles clásicos",              etiquetas: ["saltos", "obstáculos", "clásico"],        icono: "🍄",  popularidad: 80 },
  { nombre: "Pelea",          descripcion: "Combate uno a uno o en grupos",                      etiquetas: ["combate", "1v1", "torneo"],               icono: "🥊",  popularidad: 68 },
  { nombre: "Shooter",        descripcion: "Disparos en primera o tercera persona",              etiquetas: ["disparos", "FPS", "TPS"],                 icono: "🔫",  popularidad: 90 },
  { nombre: "Carreras",       descripcion: "Velocidad y competición en circuitos",               etiquetas: ["velocidad", "coches", "circuitos"],       icono: "🏎️",  popularidad: 73 },
  { nombre: "Indie",          descripcion: "Desarrolladores independientes y creativos",          etiquetas: ["independiente", "creativo", "innovador"], icono: "🎨",  popularidad: 82 },
  { nombre: "MMORPG",         descripcion: "Rol masivo multijugador en línea",                   etiquetas: ["online", "multijugador", "mundo abierto"],icono: "🌐",  popularidad: 75 },
  { nombre: "Battle Royale",  descripcion: "Supervivencia del más fuerte en partidas masivas",   etiquetas: ["supervivencia", "masivo", "competitivo"], icono: "🏆",  popularidad: 87 },
  { nombre: "Puzzles",        descripcion: "Desafíos mentales y rompecabezas",                   etiquetas: ["lógica", "desafío", "mental"],            icono: "🧩",  popularidad: 60 },
];

const categoriasInsertadas = db.categorias.insertMany(
  categoriasData.map(c => ({ ...c, fechaCreacion: new Date(), activo: true }))
);
const catIds = categoriasInsertadas.insertedIds;
const catKeys = Object.keys(catIds);
print(`✅ ${catKeys.length} categorías insertadas`);

// ─── 2. PLATAFORMAS (con documentos embebidos: especificaciones técnicas) ──
const plataformasData = [
  { nombre: "PlayStation 5",    fabricante: "Sony",      tipo: "Consola",    anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2", ram: "16GB GDDR6", almacenamiento: "825GB SSD" }, precio_consola: 499.99, activa: true },
  { nombre: "Xbox Series X",    fabricante: "Microsoft", tipo: "Consola",    anioLanzamiento: 2020, especificaciones: { cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2 12TF", ram: "16GB GDDR6", almacenamiento: "1TB SSD" }, precio_consola: 499.99, activa: true },
  { nombre: "Nintendo Switch",  fabricante: "Nintendo",  tipo: "Híbrida",    anioLanzamiento: 2017, especificaciones: { cpu: "NVIDIA Tegra X1+", gpu: "Maxwell", ram: "4GB LPDDR4", almacenamiento: "32GB eMMC" }, precio_consola: 299.99, activa: true },
  { nombre: "PC",               fabricante: "Varios",    tipo: "Computadora", anioLanzamiento: 1980, especificaciones: { cpu: "Variable", gpu: "Variable", ram: "Variable", almacenamiento: "Variable" }, precio_consola: null, activa: true },
  { nombre: "PlayStation 4",    fabricante: "Sony",      tipo: "Consola",    anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.84TF", ram: "8GB GDDR5", almacenamiento: "500GB HDD" }, precio_consola: 299.99, activa: false },
  { nombre: "Xbox One",         fabricante: "Microsoft", tipo: "Consola",    anioLanzamiento: 2013, especificaciones: { cpu: "AMD Jaguar 8-core", gpu: "AMD GCN 1.4TF", ram: "8GB DDR3", almacenamiento: "500GB HDD" }, precio_consola: 249.99, activa: false },
  { nombre: "iOS",              fabricante: "Apple",     tipo: "Móvil",      anioLanzamiento: 2007, especificaciones: { cpu: "Apple Silicon", gpu: "Apple GPU", ram: "Variable", almacenamiento: "Variable" }, precio_consola: null, activa: true },
  { nombre: "Android",          fabricante: "Google",    tipo: "Móvil",      anioLanzamiento: 2008, especificaciones: { cpu: "Variable ARM", gpu: "Variable", ram: "Variable", almacenamiento: "Variable" }, precio_consola: null, activa: true },
];

const plataformasInsertadas = db.plataformas.insertMany(
  plataformasData.map(p => ({ ...p, fechaRegistro: new Date() }))
);
const platIds = plataformasInsertadas.insertedIds;
const platKeys = Object.keys(platIds);
print(`✅ ${platKeys.length} plataformas insertadas`);

// ─── Helpers ───────────────────────────────────────────────────────────────
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max, dec = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(dec)); }
function randFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randDate(start, end) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }
function randSubset(arr, min, max) {
  const n = randInt(min, max);
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ─── 3. JUEGOS - datos base realistas ─────────────────────────────────────
const juegosBase = [
  // AAA Recientes
  { nombre: "Black Myth: Wukong",        desarrollador: "Game Science",           genero: "Acción/RPG",     precioBase: 59.99,  metacritic: 82 },
  { nombre: "Astro Bot",                  desarrollador: "Team Asobi",             genero: "Plataformas",    precioBase: 59.99,  metacritic: 94 },
  { nombre: "Elden Ring",                 desarrollador: "FromSoftware",           genero: "RPG/Acción",     precioBase: 59.99,  metacritic: 96 },
  { nombre: "God of War Ragnarök",        desarrollador: "Santa Monica Studio",    genero: "Acción/Aventura",precioBase: 69.99,  metacritic: 94 },
  { nombre: "Hogwarts Legacy",            desarrollador: "Avalanche Software",     genero: "RPG/Aventura",   precioBase: 59.99,  metacritic: 84 },
  { nombre: "Cyberpunk 2077",             desarrollador: "CD Projekt Red",         genero: "RPG/Acción",     precioBase: 59.99,  metacritic: 86 },
  { nombre: "The Legend of Zelda: TotK",  desarrollador: "Nintendo",               genero: "Aventura/RPG",   precioBase: 69.99,  metacritic: 96 },
  { nombre: "Spider-Man 2",              desarrollador: "Insomniac Games",        genero: "Acción/Aventura",precioBase: 69.99,  metacritic: 90 },
  { nombre: "Final Fantasy XVI",          desarrollador: "Square Enix",           genero: "RPG/Acción",     precioBase: 69.99,  metacritic: 87 },
  { nombre: "Starfield",                  desarrollador: "Bethesda Game Studios",  genero: "RPG/Sci-Fi",     precioBase: 69.99,  metacritic: 83 },
  { nombre: "Baldur's Gate 3",            desarrollador: "Larian Studios",         genero: "RPG",            precioBase: 59.99,  metacritic: 96 },
  { nombre: "Alan Wake 2",               desarrollador: "Remedy Entertainment",   genero: "Terror/Aventura",precioBase: 59.99,  metacritic: 89 },
  { nombre: "Resident Evil 4 Remake",    desarrollador: "Capcom",                 genero: "Terror/Acción",  precioBase: 59.99,  metacritic: 93 },
  { nombre: "Street Fighter 6",          desarrollador: "Capcom",                 genero: "Pelea",          precioBase: 59.99,  metacritic: 92 },
  { nombre: "Diablo IV",                 desarrollador: "Blizzard Entertainment", genero: "RPG/Acción",     precioBase: 69.99,  metacritic: 86 },
  { nombre: "Mortal Kombat 1",           desarrollador: "NetherRealm Studios",    genero: "Pelea",          precioBase: 69.99,  metacritic: 82 },
  { nombre: "Forza Motorsport",          desarrollador: "Turn 10 Studios",        genero: "Carreras",       precioBase: 69.99,  metacritic: 85 },
  { nombre: "EA Sports FC 24",           desarrollador: "EA Sports",              genero: "Deportes",       precioBase: 69.99,  metacritic: 79 },
  { nombre: "NBA 2K24",                  desarrollador: "Visual Concepts",        genero: "Deportes",       precioBase: 69.99,  metacritic: 71 },
  { nombre: "Call of Duty: MW3",         desarrollador: "Sledgehammer Games",     genero: "Shooter/FPS",    precioBase: 69.99,  metacritic: 56 },
  { nombre: "Helldivers 2",              desarrollador: "Arrowhead Game Studios", genero: "Shooter/Coop",   precioBase: 39.99,  metacritic: 82 },
  { nombre: "Palworld",                  desarrollador: "Pocketpair",             genero: "Aventura/Supervivencia", precioBase: 29.99, metacritic: 79 },
  { nombre: "Dave the Diver",            desarrollador: "MINTROCKET",             genero: "Indie/Aventura", precioBase: 19.99,  metacritic: 90 },
  { nombre: "Hades II",                  desarrollador: "Supergiant Games",       genero: "Indie/Roguelike",precioBase: 29.99,  metacritic: 91 },
  { nombre: "Hollow Knight: Silksong",   desarrollador: "Team Cherry",            genero: "Indie/Plataformas", precioBase: 14.99, metacritic: 0 },
  { nombre: "Lies of P",                 desarrollador: "NEOWIZ",                 genero: "Acción/RPG",     precioBase: 59.99,  metacritic: 80 },
  { nombre: "Octopath Traveler II",      desarrollador: "Square Enix",           genero: "RPG/JRPG",       precioBase: 59.99,  metacritic: 87 },
  { nombre: "The Callisto Protocol",     desarrollador: "Striking Distance Studios", genero: "Terror/Acción", precioBase: 59.99, metacritic: 68 },
  { nombre: "Returnal",                  desarrollador: "Housemarque",            genero: "Shooter/Roguelike", precioBase: 59.99, metacritic: 86 },
  { nombre: "Fortnite",                  desarrollador: "Epic Games",             genero: "Battle Royale",  precioBase: 0,      metacritic: 81 },
  { nombre: "Apex Legends",             desarrollador: "Respawn Entertainment",  genero: "Battle Royale",  precioBase: 0,      metacritic: 88 },
  { nombre: "Valorant",                  desarrollador: "Riot Games",             genero: "Shooter/Táctico",precioBase: 0,      metacritic: 80 },
  { nombre: "League of Legends",         desarrollador: "Riot Games",             genero: "MOBA/Online",    precioBase: 0,      metacritic: 82 },
  { nombre: "World of Warcraft",         desarrollador: "Blizzard Entertainment", genero: "MMORPG",         precioBase: 14.99,  metacritic: 93 },
  { nombre: "Minecraft",                 desarrollador: "Mojang Studios",         genero: "Sandbox/Aventura",precioBase: 29.99, metacritic: 93 },
  { nombre: "GTA V",                     desarrollador: "Rockstar Games",         genero: "Acción/Mundo Abierto", precioBase: 29.99, metacritic: 97 },
  { nombre: "Red Dead Redemption 2",     desarrollador: "Rockstar Games",         genero: "Acción/Western", precioBase: 59.99,  metacritic: 97 },
  { nombre: "The Witcher 3",             desarrollador: "CD Projekt Red",         genero: "RPG/Aventura",   precioBase: 39.99,  metacritic: 93 },
  { nombre: "Dark Souls III",            desarrollador: "FromSoftware",           genero: "Acción/RPG",     precioBase: 59.99,  metacritic: 89 },
  { nombre: "Sekiro: Shadows Die Twice", desarrollador: "FromSoftware",           genero: "Acción/Aventura",precioBase: 59.99,  metacritic: 90 },
  { nombre: "Ghost of Tsushima",         desarrollador: "Sucker Punch Productions", genero: "Acción/Aventura", precioBase: 59.99, metacritic: 83 },
  { nombre: "Horizon Forbidden West",    desarrollador: "Guerrilla Games",        genero: "Acción/RPG",     precioBase: 69.99,  metacritic: 88 },
  { nombre: "Ratchet & Clank: Rift Apart", desarrollador: "Insomniac Games",    genero: "Acción/Plataformas", precioBase: 69.99, metacritic: 88 },
  { nombre: "Death Stranding",           desarrollador: "Kojima Productions",     genero: "Acción/Aventura",precioBase: 39.99,  metacritic: 82 },
  { nombre: "Control",                   desarrollador: "Remedy Entertainment",  genero: "Acción/Aventura",precioBase: 39.99,  metacritic: 82 },
  { nombre: "Hades",                     desarrollador: "Supergiant Games",       genero: "Indie/Roguelike",precioBase: 24.99,  metacritic: 93 },
  { nombre: "Celeste",                   desarrollador: "Maddy Makes Games",      genero: "Indie/Plataformas", precioBase: 19.99, metacritic: 94 },
  { nombre: "Disco Elysium",             desarrollador: "ZA/UM",                  genero: "RPG/Detective",  precioBase: 39.99,  metacritic: 97 },
  { nombre: "Outer Wilds",              desarrollador: "Mobius Digital",          genero: "Aventura/Exploración", precioBase: 24.99, metacritic: 85 },
  { nombre: "Stardew Valley",           desarrollador: "ConcernedApe",           genero: "Simulación/RPG", precioBase: 14.99,  metacritic: 89 },
  // Más títulos para diversidad
  { nombre: "Tekken 8",                 desarrollador: "Bandai Namco",            genero: "Pelea",           precioBase: 69.99, metacritic: 90 },
  { nombre: "Gran Turismo 7",           desarrollador: "Polyphony Digital",       genero: "Carreras/Simulación", precioBase: 69.99, metacritic: 87 },
  { nombre: "F1 23",                    desarrollador: "Codemasters",             genero: "Carreras",        precioBase: 59.99, metacritic: 81 },
  { nombre: "Splatoon 3",              desarrollador: "Nintendo",                genero: "Shooter/Online",  precioBase: 59.99, metacritic: 83 },
  { nombre: "Pokémon Scarlet",         desarrollador: "Game Freak",              genero: "RPG/Aventura",    precioBase: 59.99, metacritic: 72 },
  { nombre: "Fire Emblem Engage",      desarrollador: "Intelligent Systems",     genero: "Estrategia/RPG",  precioBase: 59.99, metacritic: 82 },
  { nombre: "Monster Hunter Rise",     desarrollador: "Capcom",                  genero: "Acción/RPG",      precioBase: 39.99, metacritic: 88 },
  { nombre: "Devil May Cry 5",         desarrollador: "Capcom",                  genero: "Acción/Hack&Slash",precioBase: 29.99, metacritic: 89 },
  { nombre: "Persona 5 Royal",         desarrollador: "Atlus",                   genero: "JRPG",            precioBase: 59.99, metacritic: 95 },
  { nombre: "Yakuza: Like a Dragon",   desarrollador: "Ryu Ga Gotoku Studio",    genero: "RPG/Acción",      precioBase: 59.99, metacritic: 85 },
  { nombre: "Sifu",                    desarrollador: "Sloclap",                 genero: "Acción/Pelea",    precioBase: 39.99, metacritic: 80 },
  { nombre: "It Takes Two",            desarrollador: "Hazelight Studios",       genero: "Plataformas/Coop",precioBase: 39.99, metacritic: 94 },
  { nombre: "Kena: Bridge of Spirits", desarrollador: "Ember Lab",               genero: "Acción/Aventura", precioBase: 39.99, metacritic: 80 },
  { nombre: "Deathloop",               desarrollador: "Arkane Studios",          genero: "Shooter/Sigilo",  precioBase: 59.99, metacritic: 88 },
  { nombre: "Guardians of the Galaxy", desarrollador: "Eidos-Montréal",          genero: "Acción/Aventura", precioBase: 59.99, metacritic: 84 },
  { nombre: "Gotham Knights",          desarrollador: "WB Games Montréal",       genero: "Acción/RPG",      precioBase: 59.99, metacritic: 70 },
  { nombre: "Suicide Squad: KTJL",     desarrollador: "Rocksteady Studios",      genero: "Shooter/Acción",  precioBase: 69.99, metacritic: 60 },
  { nombre: "Immortals Fenyx Rising",  desarrollador: "Ubisoft Quebec",          genero: "Acción/Aventura", precioBase: 39.99, metacritic: 80 },
  { nombre: "Far Cry 6",              desarrollador: "Ubisoft Toronto",          genero: "Shooter/Aventura",precioBase: 59.99, metacritic: 73 },
  { nombre: "Assassin's Creed Mirage", desarrollador: "Ubisoft Bordeaux",        genero: "Acción/Aventura", precioBase: 49.99, metacritic: 76 },
  { nombre: "Watch Dogs Legion",       desarrollador: "Ubisoft Toronto",          genero: "Acción/Mundo Abierto", precioBase: 39.99, metacritic: 73 },
  { nombre: "Uncharted 4",            desarrollador: "Naughty Dog",              genero: "Acción/Aventura", precioBase: 39.99, metacritic: 93 },
  { nombre: "The Last of Us Part I",  desarrollador: "Naughty Dog",              genero: "Acción/Terror",   precioBase: 69.99, metacritic: 89 },
  { nombre: "Ghost Runner",           desarrollador: "One More Level",           genero: "Acción/Plataformas",precioBase: 29.99,metacritic: 80 },
  { nombre: "Plague Tale Requiem",     desarrollador: "Asobo Studio",             genero: "Aventura/Terror", precioBase: 59.99, metacritic: 87 },
  { nombre: "Forspoken",              desarrollador: "Luminous Productions",      genero: "RPG/Acción",      precioBase: 69.99, metacritic: 67 },
  { nombre: "Scorn",                  desarrollador: "Ebb Software",             genero: "Terror/Aventura", precioBase: 39.99, metacritic: 63 },
  { nombre: "Signalis",               desarrollador: "rose-engine",              genero: "Indie/Terror",    precioBase: 14.99, metacritic: 86 },
  { nombre: "Tunic",                  desarrollador: "Andrew Shouldice",         genero: "Indie/Aventura",  precioBase: 29.99, metacritic: 86 },
  { nombre: "Neon White",             desarrollador: "Angel Matrix",             genero: "Indie/Shooter",   precioBase: 24.99, metacritic: 90 },
  { nombre: "Vampire Survivors",      desarrollador: "poncle",                   genero: "Indie/Roguelike", precioBase: 4.99,  metacritic: 87 },
  { nombre: "Pizza Tower",            desarrollador: "Tour De Pizza",            genero: "Indie/Plataformas",precioBase: 11.99,metacritic: 89 },
  { nombre: "Dredge",                 desarrollador: "Black Salt Games",         genero: "Indie/Pesca",     precioBase: 24.99, metacritic: 83 },
  { nombre: "Sea of Stars",           desarrollador: "Sabotage Studio",          genero: "Indie/RPG",       precioBase: 34.99, metacritic: 88 },
  { nombre: "Cocoon",                 desarrollador: "Geometric Interactive",    genero: "Indie/Puzzles",   precioBase: 24.99, metacritic: 91 },
  { nombre: "Jusant",                 desarrollador: "DON'T NOD",                genero: "Indie/Aventura",  precioBase: 24.99, metacritic: 83 },
  { nombre: "Oxenfree II",            desarrollador: "Night School Studio",      genero: "Indie/Aventura",  precioBase: 19.99, metacritic: 79 },
  { nombre: "Prodeus",                desarrollador: "Bounding Box Software",    genero: "Shooter/Retro",   precioBase: 19.99, metacritic: 82 },
  { nombre: "Terra Nil",              desarrollador: "Free Lives",               genero: "Estrategia/Eco",  precioBase: 19.99, metacritic: 80 },
  { nombre: "Slay the Spire",        desarrollador: "MegaCrit",                 genero: "Indie/Estrategia",precioBase: 24.99, metacritic: 89 },
  { nombre: "Into the Breach",       desarrollador: "Subset Games",             genero: "Indie/Estrategia",precioBase: 14.99, metacritic: 90 },
  { nombre: "Spiritfarer",           desarrollador: "Thunder Lotus Games",      genero: "Indie/Aventura",  precioBase: 29.99, metacritic: 85 },
  { nombre: "Cult of the Lamb",      desarrollador: "Massive Monster",           genero: "Indie/Roguelike", precioBase: 24.99, metacritic: 83 },
  { nombre: "Citizen Sleeper",       desarrollador: "Jump Over The Age",         genero: "Indie/RPG",       precioBase: 19.99, metacritic: 87 },
  { nombre: "Weird West",            desarrollador: "WolfEye Studios",           genero: "RPG/Western",     precioBase: 39.99, metacritic: 76 },
  { nombre: "Norco",                 desarrollador: "Geography of Robots",       genero: "Indie/Aventura",  precioBase: 14.99, metacritic: 87 },
  { nombre: "Trombone Champ",        desarrollador: "Holy Wow Studios",          genero: "Indie/Música",    precioBase: 14.99, metacritic: 84 },
  { nombre: "PowerWash Simulator",   desarrollador: "FuturLab",                  genero: "Simulación",      precioBase: 19.99, metacritic: 76 },
  { nombre: "House Flipper 2",       desarrollador: "Frozen District",           genero: "Simulación",      precioBase: 29.99, metacritic: 72 },
  { nombre: "Cities Skylines II",    desarrollador: "Colossal Order",            genero: "Estrategia/Simulación", precioBase: 49.99, metacritic: 62 },
  { nombre: "Football Manager 2024", desarrollador: "Sports Interactive",        genero: "Estrategia/Deportes",precioBase: 54.99, metacritic: 82 },
  { nombre: "Age of Empires IV",     desarrollador: "Relic Entertainment",       genero: "Estrategia/RTS",  precioBase: 59.99, metacritic: 81 },
  { nombre: "Company of Heroes 3",   desarrollador: "Relic Entertainment",       genero: "Estrategia/RTS",  precioBase: 49.99, metacritic: 76 },
  { nombre: "Total War: Pharaoh",    desarrollador: "Creative Assembly",         genero: "Estrategia",      precioBase: 59.99, metacritic: 72 },
  { nombre: "Crusader Kings III",    desarrollador: "Paradox Development",       genero: "Estrategia/RPG",  precioBase: 49.99, metacritic: 91 },
  { nombre: "Civilization VI",       desarrollador: "Firaxis Games",             genero: "Estrategia/Turnos",precioBase: 59.99, metacritic: 88 },
  { nombre: "XCOM 2",               desarrollador: "Firaxis Games",             genero: "Estrategia/Turnos",precioBase: 49.99, metacritic: 88 },
  { nombre: "Warhammer 40K: Boltgun",desarrollador: "Auroch Digital",           genero: "Shooter/Retro",   precioBase: 24.99, metacritic: 78 },
  { nombre: "Dead Space Remake",     desarrollador: "Motive Studio",            genero: "Terror/Acción",   precioBase: 69.99, metacritic: 89 },
  { nombre: "The Quarry",            desarrollador: "Supermassive Games",        genero: "Terror/Narrativa", precioBase: 59.99, metacritic: 79 },
  { nombre: "Sons of the Forest",    desarrollador: "Endnight Games",           genero: "Supervivencia/Terror",precioBase: 29.99,metacritic: 78 },
  { nombre: "Planet of Lana",        desarrollador: "Wishfully",                genero: "Indie/Aventura",  precioBase: 19.99, metacritic: 82 },
  { nombre: "Hi-Fi Rush",           desarrollador: "Tango Gameworks",           genero: "Acción/Música",   precioBase: 29.99, metacritic: 87 },
  { nombre: "Armored Core VI",       desarrollador: "FromSoftware",             genero: "Acción/Mechs",    precioBase: 59.99, metacritic: 87 },
  { nombre: "Phantom Liberty (DLC)", desarrollador: "CD Projekt Red",           genero: "RPG/Acción",      precioBase: 29.99, metacritic: 90 },
];

// ─── Plataformas disponibles por tipo de juego ─────────────────────────────
const plataformasPorJuego = {
  "PC": platKeys[3],
  "PlayStation 5": platKeys[0],
  "Xbox Series X": platKeys[1],
  "Nintendo Switch": platKeys[2],
  "PlayStation 4": platKeys[4],
  "Xbox One": platKeys[5],
  "iOS": platKeys[6],
  "Android": platKeys[7],
};

const combosPlataforma = [
  ["PC", "PlayStation 5", "Xbox Series X"],
  ["PC", "PlayStation 5"],
  ["PC", "Xbox Series X"],
  ["PlayStation 5", "Xbox Series X"],
  ["PC"],
  ["Nintendo Switch"],
  ["PC", "Nintendo Switch"],
  ["PlayStation 5", "Xbox Series X", "Nintendo Switch", "PC"],
  ["iOS", "Android"],
  ["PC", "iOS", "Android"],
];

const edades = ["E", "E10+", "T", "M", "AO"];
const idiomas = ["Español", "Inglés", "Francés", "Alemán", "Japonés", "Portugués", "Italiano"];
const modos = ["Un jugador", "Multijugador local", "Multijugador online", "Cooperativo", "PvP"];
const imagenes = [
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co5q97.jpg",
  "https://images.igdb.com/igdb/image/upload/t_cover_big/co2ekt.jpg",
];

// ─── Generar 1000+ juegos ─────────────────────────────────────────────────
const juegosParaInsertar = [];
let contador = 0;

// Función para mapear género a categoría ObjectId
function getCategoriaId(genero) {
  const map = {
    "Acción": 0, "Aventura": 1, "RPG": 2, "Deportes": 3, "Estrategia": 4,
    "Terror": 5, "Simulación": 6, "Plataformas": 7, "Pelea": 8, "Shooter": 9,
    "Carreras": 10, "Indie": 11, "MMORPG": 12, "Battle Royale": 13, "Puzzles": 14,
  };
  const key = Object.keys(map).find(k => genero.includes(k));
  return key !== undefined ? catIds[map[key]] : catIds[0];
}

// Insertar cada juego base una vez, luego generar variantes hasta 1000
for (let i = 0; i < juegosBase.length; i++) {
  const base = juegosBase[i];
  const combo = randFrom(combosPlataforma);
  const platsIds = combo.map(p => plataformasPorJuego[p]).filter(Boolean);
  const descuento = Math.random() > 0.6 ? randInt(5, 50) : 0;
  const precioFinal = parseFloat((base.precioBase * (1 - descuento / 100)).toFixed(2));

  juegosParaInsertar.push({
    nombre: base.nombre,
    desarrollador: base.desarrollador,
    genero: base.genero,
    categoriaId: getCategoriaId(base.genero),
    plataformas: platsIds,
    precio: precioFinal,
    precioOriginal: base.precioBase,
    descuento: descuento,
    enOferta: descuento > 0,
    metacritic: base.metacritic,
    url: `https://www.eneba.com/latam/${base.nombre.toLowerCase().replace(/[^a-z0-9]/g,"-")}`,
    imagen: randFrom(imagenes),
    likes: randInt(100, 98000),
    ventas: randInt(50, 500000),
    stock: randInt(0, 9999),
    calificacion: randFloat(1, 5, 1),
    numReseñas: randInt(10, 50000),
    idiomas: randSubset(idiomas, 2, 5),
    modos: randSubset(modos, 1, 3),
    clasificacion: randFrom(edades),
    fechaLanzamiento: randDate(new Date(2015, 0, 1), new Date(2024, 11, 31)),
    fechaRegistro: new Date(),
    destacado: Math.random() > 0.8,
    dlc: Math.random() > 0.7,
    multijugador: base.genero.includes("Online") || base.genero.includes("Multijugador") || base.genero.includes("Battle") || base.genero.includes("MOBA"),
    // Documento embebido: requisitos técnicos
    requisitos: {
      minimos: {
        so: "Windows 10 64-bit",
        procesador: "Intel Core i5-8400 / AMD Ryzen 5 2600",
        memoria: `${randFrom([8, 12, 16])}GB RAM`,
        grafica: "NVIDIA GTX 1060 6GB / AMD RX 580",
        almacenamiento: `${randInt(20, 150)}GB`,
      },
      recomendados: {
        so: "Windows 11 64-bit",
        procesador: "Intel Core i7-12700K / AMD Ryzen 7 5800X",
        memoria: `${randFrom([16, 32])}GB RAM`,
        grafica: "NVIDIA RTX 3080 / AMD RX 6800 XT",
        almacenamiento: `${randInt(50, 200)}GB SSD`,
      }
    },
    // Array de reseñas embebidas
    reseñasDestacadas: [
      { usuario: `user_${randInt(1000,9999)}`, puntuacion: randInt(3,5), comentario: "Excelente juego, lo recomiendo.", fecha: randDate(new Date(2023,0,1), new Date(2024,11,31)) },
      { usuario: `user_${randInt(1000,9999)}`, puntuacion: randInt(1,5), comentario: "Buena experiencia en general.", fecha: randDate(new Date(2023,0,1), new Date(2024,11,31)) },
    ]
  });
  contador++;
}

// ─── Generar variantes adicionales para llegar a 1000+ ────────────────────
const sufijos = ["Edición Deluxe","GOTY Edition","Complete Edition","Remastered","Director's Cut",
                  "Enhanced Edition","Ultimate Edition","Gold Edition","Digital Deluxe","Anniversary"];
const prefijosExtra = ["Super ","Mega ","Ultra ","Neo ","Hyper ","Alpha ","Final ","Extreme ","Pro "];
const desarrolladoresExtra = [
  "Ubisoft","EA Games","Activision","Konami","Sega","Namco","2K Games",
  "THQ Nordic","Focus Entertainment","Nacon","505 Games","Team17",
  "Devolver Digital","Annapurna Interactive","Raw Fury","Humble Games",
];
const generosExtra = ["Acción","Aventura","RPG","Deportes","Estrategia","Terror","Simulación",
                       "Plataformas","Pelea","Shooter","Carreras","Indie","Puzzles"];

while (contador < 1050) {
  const base = randFrom(juegosBase);
  const esVariante = Math.random() > 0.5;
  const nombre = esVariante
    ? `${base.nombre} - ${randFrom(sufijos)}`
    : `${randFrom(prefijosExtra)}${base.nombre.split(":")[0]}`;
  const combo = randFrom(combosPlataforma);
  const platsIds = combo.map(p => plataformasPorJuego[p]).filter(Boolean);
  const precioBase = randFloat(4.99, 79.99);
  const descuento = Math.random() > 0.5 ? randInt(5, 70) : 0;
  const precioFinal = parseFloat((precioBase * (1 - descuento / 100)).toFixed(2));
  const genero = randFrom(generosExtra);

  juegosParaInsertar.push({
    nombre,
    desarrollador: Math.random() > 0.5 ? base.desarrollador : randFrom(desarrolladoresExtra),
    genero,
    categoriaId: getCategoriaId(genero),
    plataformas: platsIds,
    precio: precioFinal,
    precioOriginal: precioBase,
    descuento,
    enOferta: descuento > 0,
    metacritic: randInt(50, 99),
    url: `https://www.eneba.com/latam/${nombre.toLowerCase().replace(/[^a-z0-9]/g,"-")}`,
    imagen: randFrom(imagenes),
    likes: randInt(10, 50000),
    ventas: randInt(10, 200000),
    stock: randInt(0, 9999),
    calificacion: randFloat(1, 5, 1),
    numReseñas: randInt(5, 20000),
    idiomas: randSubset(idiomas, 1, 4),
    modos: randSubset(modos, 1, 3),
    clasificacion: randFrom(edades),
    fechaLanzamiento: randDate(new Date(2010, 0, 1), new Date(2024, 11, 31)),
    fechaRegistro: new Date(),
    destacado: Math.random() > 0.85,
    dlc: Math.random() > 0.75,
    multijugador: Math.random() > 0.6,
    requisitos: {
      minimos: {
        so: "Windows 10 64-bit",
        procesador: "Intel Core i5 / AMD Ryzen 5",
        memoria: `${randFrom([8, 16])}GB RAM`,
        grafica: "NVIDIA GTX 970 / AMD RX 480",
        almacenamiento: `${randInt(10, 100)}GB`,
      },
      recomendados: {
        so: "Windows 11 64-bit",
        procesador: "Intel Core i7 / AMD Ryzen 7",
        memoria: `${randFrom([16, 32])}GB RAM`,
        grafica: "NVIDIA RTX 2080 / AMD RX 6700 XT",
        almacenamiento: `${randInt(30, 150)}GB SSD`,
      }
    },
    reseñasDestacadas: [
      { usuario: `user_${randInt(1000,9999)}`, puntuacion: randInt(1,5), comentario: "Muy entretenido.", fecha: new Date() },
    ]
  });
  contador++;
}

// Insertar en lotes de 200
const LOTE = 200;
let insertados = 0;
for (let i = 0; i < juegosParaInsertar.length; i += LOTE) {
  db.juegos.insertMany(juegosParaInsertar.slice(i, i + LOTE));
  insertados += Math.min(LOTE, juegosParaInsertar.length - i);
}
print(`✅ ${insertados} juegos insertados`);

// ─── Índices ───────────────────────────────────────────────────────────────
db.juegos.createIndex({ nombre: "text", desarrollador: "text" }, { name: "idx_texto_busqueda" });
db.juegos.createIndex({ categoriaId: 1 });
db.juegos.createIndex({ precio: 1 });
db.juegos.createIndex({ metacritic: -1 });
db.juegos.createIndex({ likes: -1 });
db.juegos.createIndex({ fechaLanzamiento: -1 });
db.juegos.createIndex({ enOferta: 1, descuento: -1 });
db.categorias.createIndex({ nombre: 1 }, { unique: true });
db.plataformas.createIndex({ nombre: 1 }, { unique: true });
print("✅ Índices creados");

// ─── 4. RESEÑAS — 1000+ documentos de prueba ──────────────────────────────
db.resenas.drop();
print("🗑️  Colección resenas eliminada. Generando reseñas...");

const todosLosJuegos = db.juegos.find({}, { _id: 1 }).toArray();
const totalJuegosDisp = todosLosJuegos.length;

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

const nombresUsuarios = [
  "GamerXtreme", "NocturnePlayer", "PixelHunter", "ShadowRogue", "StarForge",
  "VoidWalker", "CryptoNinja", "RetroKing", "NeonBlade", "IronFist",
  "StormCaster", "DarkMatter", "LunarEcho", "PhoenixRise", "CyberWolf",
  "ThunderStrike", "MysticSage", "SilverArrow", "GhostRider", "ArcLight",
  "DragonSlayer", "RuneKeeper", "BlazeFury", "IceBreaker", "VortexOne",
  "NightOwl", "SteelHeart", "WildCard", "CodeBreaker", "LegendKiller",
  "ProGamer99", "CasualPlayer", "HardcoreElite", "SpeedRunner", "Completionist",
  "RPGLover", "StrategyMind", "ActionJunkie", "HorrorFan", "RacingAce",
  "user_4521", "user_7832", "user_1193", "user_6647", "user_3315",
  "user_9002", "user_5578", "user_2241", "user_8864", "user_4409",
];

const resenasParaInsertar = [];
const fechaInicio = new Date(2022, 0, 1);
const fechaFin    = new Date(2025, 2, 31);

for (let i = 0; i < 1200; i++) {
  const juegoObj  = todosLosJuegos[Math.floor(Math.random() * totalJuegosDisp)];
  const puntuacion = randInt(1, 5);

  let comentario;
  if (puntuacion >= 4) {
    comentario = randFrom(comentariosPositivos);
  } else if (puntuacion === 3) {
    comentario = randFrom(comentariosMedios);
  } else {
    comentario = randFrom(comentariosNegativos);
  }

  // Añadir variación al comentario para que no sean todos iguales
  const sufijosExtra = [
    "", " Muy recomendado.", " Lo volveré a jugar.", " ¡No te lo pierdas!",
    " Una pena.", " Podría mejorar mucho.", " En oferta vale la pena.",
    " Esperaba más.", " Gran trabajo del equipo.", " La comunidad es genial.",
  ];
  comentario += randFrom(sufijosExtra);

  resenasParaInsertar.push({
    juegoId:      juegoObj._id,
    usuarioId:    null,
    usuarioNombre: randFrom(nombresUsuarios) + "_" + randInt(10, 99),
    esAnonimo:    true,
    puntuacion,
    comentario:   comentario.trim().substring(0, 500),
    fecha:        randDate(fechaInicio, fechaFin),
  });
}

// Insertar en lotes de 200
let resenasInsertadas = 0;
for (let i = 0; i < resenasParaInsertar.length; i += 200) {
  db.resenas.insertMany(resenasParaInsertar.slice(i, i + 200));
  resenasInsertadas += Math.min(200, resenasParaInsertar.length - i);
}
print(`✅ ${resenasInsertadas} reseñas insertadas`);

// Índices para resenas
db.resenas.createIndex({ juegoId: 1 });
db.resenas.createIndex({ fecha: -1 });
db.resenas.createIndex({ puntuacion: 1 });
print("✅ Índices de resenas creados");

// Recalcular calificación promedio de los juegos que recibieron reseñas
print("🔄 Recalculando calificaciones de juegos...");
const statsResenas = db.resenas.aggregate([
  { $group: {
      _id: "$juegoId",
      promedio: { $avg: "$puntuacion" },
      total:    { $sum: 1 }
  }}
]).toArray();

statsResenas.forEach(s => {
  db.juegos.updateOne(
    { _id: s._id },
    { $set: {
        calificacion: parseFloat(s.promedio.toFixed(1)),
        numReseñas:   s.total,
    }}
  );
});
print(`✅ Calificaciones actualizadas para ${statsResenas.length} juegos`);

// ─── Verificación final ────────────────────────────────────────────────────
print("\n📊 RESUMEN:");
print(`   Categorías: ${db.categorias.countDocuments()}`);
print(`   Plataformas: ${db.plataformas.countDocuments()}`);
print(`   Juegos:      ${db.juegos.countDocuments()}`);
print(`   Reseñas:     ${db.resenas.countDocuments()}`);
print("\n🎮 Seed completado exitosamente.");
