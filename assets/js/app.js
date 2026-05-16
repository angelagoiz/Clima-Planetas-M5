// app.js — Exploración Espacial · POO + ES6+ + async/await + Open-Meteo

// ── ApiClient: toda comunicación con APIs externas ──
class ApiClient {
  async get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
    return res.json();
  }

  async obtenerPronosticoTierra() {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=-33.45&longitude=-70.67" +
      "&daily=temperature_2m_max,temperature_2m_min,weathercode" +
      "&timezone=America%2FSantiago&forecast_days=7";
    const { daily } = await this.get(url);
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    return daily.time.map((fecha, i) => ({
      dia: dias[new Date(fecha).getDay() === 0 ? 6 : new Date(fecha).getDay() - 1],
      min: Math.round(daily.temperature_2m_min[i]),
      max: Math.round(daily.temperature_2m_max[i]),
      estado: ApiClient.wmoAEstado(daily.weathercode[i]),
    }));
  }

  static wmoAEstado(code) {
    if (code === 0) return "Despejado";
    if (code <= 3)  return "Nublado";
    if (code <= 49) return "Niebla";
    if (code <= 67) return "Lluvioso";
    if (code <= 77) return "Nevado";
    if (code <= 82) return "Lluvioso";
    if (code <= 99) return "Tormenta";
    return "Variable";
  }
}

// ── LugarClima: modela un cuerpo celeste ──
class LugarClima {
  constructor({ id, nombre, img, desc, tempActual, estadoActual, modifier, pronosticoSemanal = [], usaApiReal = false }) {
    Object.assign(this, { id, nombre, img, desc, tempActual, estadoActual, modifier, pronosticoSemanal, usaApiReal });
  }
  formatTemp(t = this.tempActual) {
    return `${t > 0 ? "+" : ""}${t} °C`;
  }
}

// ── WeatherApp: orquesta la app ──
class WeatherApp {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.lugares   = this._initLugares();
    this.colorMap  = {
      hot:    { bg: "rgba(239,68,68,0.25)",  color: "#fca5a5", border: "rgba(239,68,68,0.3)"   },
      warm:   { bg: "rgba(249,115,22,0.25)", color: "#fdba74", border: "rgba(249,115,22,0.3)"  },
      mild:   { bg: "rgba(34,197,94,0.2)",   color: "#86efac", border: "rgba(34,197,94,0.3)"   },
      cold:   { bg: "rgba(56,189,248,0.2)",  color: "#7dd3fc", border: "rgba(56,189,248,0.3)"  },
      frozen: { bg: "rgba(129,140,248,0.2)", color: "#c4b5fd", border: "rgba(129,140,248,0.3)" },
    };
  }

  _initLugares() {
    return [
      { id: "sol", nombre: "Sol", img: "assets/img/sol.png", modifier: "hot", tempActual: 5500, estadoActual: "Plasma",
        desc: "La parte más caliente del Sol es su núcleo, donde las temperaturas superan los 27 millones de °F (15 millones de °C). La fotosfera tiene una temperatura de 5500 °C. La corona exterior alcanza hasta 2 millones de °C, uno de los grandes misterios solares.",
        pronosticoSemanal: [
          { dia: "Lunes", min: 5400, max: 5600, estado: "Plasma" },      { dia: "Martes", min: 5350, max: 5650, estado: "Plasma" },
          { dia: "Miércoles", min: 5300, max: 5700, estado: "Llamarada" },{ dia: "Jueves", min: 5500, max: 5800, estado: "Llamarada" },
          { dia: "Viernes", min: 5450, max: 5750, estado: "Plasma" },    { dia: "Sábado", min: 5380, max: 5620, estado: "Plasma" },
          { dia: "Domingo", min: 5320, max: 5580, estado: "Llamarada" },
        ]},
      { id: "mercurio", nombre: "Mercurio", img: "assets/img/mercurio.png", modifier: "warm", tempActual: 167, estadoActual: "Soleado",
        desc: "Mercurio experimenta temperaturas extremas por carecer de atmósfera densa. De día puede alcanzar 430 °C; de noche cae hasta -180 °C. Su temperatura promedio es 167 °C.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -170, max: 420, estado: "Soleado" },   { dia: "Martes", min: -180, max: 430, estado: "Soleado" },
          { dia: "Miércoles", min: -160, max: 410, estado: "Soleado" },{ dia: "Jueves", min: -175, max: 425, estado: "Soleado" },
          { dia: "Viernes", min: -165, max: 415, estado: "Ventoso" }, { dia: "Sábado", min: -170, max: 420, estado: "Soleado" },
          { dia: "Domingo", min: -180, max: 430, estado: "Ventoso" },
        ]},
      { id: "venus", nombre: "Venus", img: "assets/img/venus.png", modifier: "hot", tempActual: 464, estadoActual: "Tormentoso",
        desc: "Venus es el planeta más caliente del sistema solar por su efecto invernadero extremo, con temperaturas superficiales que alcanzan los 464 °C incluso de noche.",
        pronosticoSemanal: [
          { dia: "Lunes", min: 460, max: 470, estado: "Tormentoso" }, { dia: "Martes", min: 458, max: 468, estado: "Tormentoso" },
          { dia: "Miércoles", min: 462, max: 472, estado: "Ácido" },   { dia: "Jueves", min: 461, max: 469, estado: "Tormentoso" },
          { dia: "Viernes", min: 459, max: 467, estado: "Ácido" },   { dia: "Sábado", min: 463, max: 471, estado: "Tormentoso" },
          { dia: "Domingo", min: 460, max: 466, estado: "Ácido" },
        ]},
      { id: "tierra", nombre: "Tierra", img: "assets/img/tierra.png", modifier: "mild", tempActual: 15, estadoActual: "Cargando…",
        desc: "Nuestro planeta tiene una temperatura media de 15 °C. Registra extremos desde -89 °C en la Antártida hasta +56,7 °C en el Valle de la Muerte.",
        pronosticoSemanal: [], usaApiReal: true },
      { id: "marte", nombre: "Marte", img: "assets/img/marte.png", modifier: "cold", tempActual: -65, estadoActual: "Tormenta de polvo",
        desc: "La temperatura media de Marte es -65 °C. Puede alcanzar 20 °C al mediodía en el ecuador en verano, pero cae a -153 °C durante la noche. Frecuentes tormentas de polvo.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -90, max: -40, estado: "Tormenta de polvo" },  { dia: "Martes", min: -85, max: -35, estado: "Despejado" },
          { dia: "Miércoles", min: -95, max: -50, estado: "Tormenta de polvo" },{ dia: "Jueves", min: -80, max: -30, estado: "Despejado" },
          { dia: "Viernes", min: -75, max: -25, estado: "Despejado" },         { dia: "Sábado", min: -88, max: -40, estado: "Tormenta de polvo" },
          { dia: "Domingo", min: -92, max: -45, estado: "Despejado" },
        ]},
      { id: "jupiter", nombre: "Júpiter", img: "assets/img/jupiter.png", modifier: "cold", tempActual: -110, estadoActual: "Tormenta",
        desc: "Júpiter tiene una temperatura media de -110 °C en sus nubes superiores. Su Gran Mancha Roja es una tormenta activa hace siglos. Sin superficie sólida definida.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -120, max: -100, estado: "Tormenta" }, { dia: "Martes", min: -115, max: -105, estado: "Tormenta" },
          { dia: "Miércoles", min: -118, max: -102, estado: "Ventoso" }, { dia: "Jueves", min: -112, max: -98, estado: "Tormenta" },
          { dia: "Viernes", min: -110, max: -95, estado: "Ventoso" }, { dia: "Sábado", min: -116, max: -100, estado: "Tormenta" },
          { dia: "Domingo", min: -119, max: -103, estado: "Tormenta" },
        ]},
      { id: "saturno", nombre: "Saturno", img: "assets/img/saturno.png", modifier: "cold", tempActual: -140, estadoActual: "Ventoso",
        desc: "Saturno tiene una temperatura media de -140 °C. Es famoso por sus espectaculares anillos. Su atmósfera de hidrógeno y helio genera vientos de hasta 1800 km/h.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -150, max: -130, estado: "Ventoso" },   { dia: "Martes", min: -145, max: -135, estado: "Ventoso" },
          { dia: "Miércoles", min: -148, max: -132, estado: "Tormenta" },{ dia: "Jueves", min: -142, max: -128, estado: "Ventoso" },
          { dia: "Viernes", min: -140, max: -125, estado: "Despejado" },{ dia: "Sábado", min: -147, max: -130, estado: "Ventoso" },
          { dia: "Domingo", min: -150, max: -135, estado: "Tormenta" },
        ]},
      { id: "urano", nombre: "Urano", img: "assets/img/urano.png", modifier: "frozen", tempActual: -195, estadoActual: "Helado",
        desc: "Urano es el planeta más frío del sistema solar con una temperatura media de -195 °C. Está inclinado casi 98° y su atmósfera contiene metano que le da su color azul-verdoso.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -200, max: -188, estado: "Helado" },  { dia: "Martes", min: -198, max: -190, estado: "Helado" },
          { dia: "Miércoles", min: -202, max: -186, estado: "Nublado" },{ dia: "Jueves", min: -195, max: -185, estado: "Helado" },
          { dia: "Viernes", min: -197, max: -187, estado: "Nublado" },{ dia: "Sábado", min: -200, max: -190, estado: "Helado" },
          { dia: "Domingo", min: -196, max: -188, estado: "Helado" },
        ]},
      { id: "neptuno", nombre: "Neptuno", img: "assets/img/neptuno.png", modifier: "frozen", tempActual: -200, estadoActual: "Tormenta helada",
        desc: "Neptuno es uno de los planetas más fríos con -200 °C de media. Sus vientos alcanzan los 2100 km/h, los más rápidos del sistema solar.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -210, max: -190, estado: "Tormenta helada" }, { dia: "Martes", min: -205, max: -195, estado: "Tormenta helada" },
          { dia: "Miércoles", min: -208, max: -192, estado: "Ventoso" },      { dia: "Jueves", min: -200, max: -188, estado: "Tormenta helada" },
          { dia: "Viernes", min: -202, max: -190, estado: "Ventoso" },       { dia: "Sábado", min: -207, max: -193, estado: "Tormenta helada" },
          { dia: "Domingo", min: -210, max: -196, estado: "Tormenta helada" },
        ]},
      { id: "55-cancri-e", nombre: "55 Cancri e", img: "assets/img/55 Cancri e.png", modifier: "hot", tempActual: 2000, estadoActual: "Magma",
        desc: "55 Cancri e es un exoplaneta super-Tierra rocoso a 41 años luz, con temperaturas que superan los 2000 °C. Se especula que puede tener grafito y diamante en su composición.",
        pronosticoSemanal: [
          { dia: "Lunes", min: 1900, max: 2100, estado: "Magma" },    { dia: "Martes", min: 1950, max: 2150, estado: "Magma" },
          { dia: "Miércoles", min: 1880, max: 2080, estado: "Erupción" },{ dia: "Jueves", min: 2000, max: 2200, estado: "Erupción" },
          { dia: "Viernes", min: 1920, max: 2120, estado: "Magma" },  { dia: "Sábado", min: 1960, max: 2060, estado: "Magma" },
          { dia: "Domingo", min: 1990, max: 2090, estado: "Erupción" },
        ]},
      { id: "HD_189733_b", nombre: "HD 189733 b", img: "assets/img/HD_189733_b.png", modifier: "hot", tempActual: 1200, estadoActual: "Lluvia de silicatos",
        desc: "HD 189733 b es un Júpiter caliente azul cobalto a 63 años luz. Su temperatura media es 1200 °C y llueven cristales de sílice a más de 9000 km/h.",
        pronosticoSemanal: [
          { dia: "Lunes", min: 1150, max: 1250, estado: "Lluvia de silicatos" }, { dia: "Martes", min: 1180, max: 1270, estado: "Lluvia de silicatos" },
          { dia: "Miércoles", min: 1160, max: 1240, estado: "Ventisca" },         { dia: "Jueves", min: 1190, max: 1280, estado: "Lluvia de silicatos" },
          { dia: "Viernes", min: 1170, max: 1260, estado: "Ventisca" },          { dia: "Sábado", min: 1155, max: 1245, estado: "Lluvia de silicatos" },
          { dia: "Domingo", min: 1185, max: 1275, estado: "Lluvia de silicatos" },
        ]},
      { id: "OGLE-2005-BLG-390Lb", nombre: "OGLE-2005-BLG-390Lb", img: "assets/img/OGLE-2005-BLG-390Lb.png", modifier: "frozen", tempActual: -220, estadoActual: "Congelado",
        desc: "Conocido como 'Hoth', este exoplaneta a 21.000 años luz tiene una temperatura media de -220 °C. Es uno de los planetas más fríos conocidos fuera del sistema solar.",
        pronosticoSemanal: [
          { dia: "Lunes", min: -225, max: -215, estado: "Congelado" }, { dia: "Martes", min: -222, max: -218, estado: "Congelado" },
          { dia: "Miércoles", min: -228, max: -212, estado: "Ventisca" },{ dia: "Jueves", min: -220, max: -210, estado: "Congelado" },
          { dia: "Viernes", min: -223, max: -213, estado: "Ventisca" }, { dia: "Sábado", min: -226, max: -216, estado: "Congelado" },
          { dia: "Domingo", min: -221, max: -211, estado: "Congelado" },
        ]},
    ].map((cfg) => new LugarClima(cfg));
  }

  async cargarLugares() {
    const tierra = this.lugares.find((l) => l.id === "tierra");
    if (tierra) {
      try {
        const pronostico = await this.apiClient.obtenerPronosticoTierra();
        tierra.pronosticoSemanal = pronostico;
        if (pronostico.length > 0) {
          tierra.tempActual   = Math.round((pronostico[0].min + pronostico[0].max) / 2);
          tierra.estadoActual = pronostico[0].estado;
        }
      } catch (err) {
        console.warn("Fallback datos Tierra:", err.message);
        tierra.pronosticoSemanal = [
          { dia: "Lunes", min: 10, max: 22, estado: "Soleado" },   { dia: "Martes", min: 12, max: 24, estado: "Soleado" },
          { dia: "Miércoles", min: 8, max: 18, estado: "Lluvioso" },{ dia: "Jueves", min: 9, max: 17, estado: "Nublado" },
          { dia: "Viernes", min: 11, max: 20, estado: "Soleado" }, { dia: "Sábado", min: 13, max: 23, estado: "Soleado" },
          { dia: "Domingo", min: 7, max: 16, estado: "Lluvioso" },
        ];
        tierra.tempActual = 15; tierra.estadoActual = "Nublado";
      }
    }
    return this.lugares;
  }

  async cargarDetalleLugar(id) {
    const lugar = this.lugares.find((l) => l.id === id) ?? null;
    if (lugar?.usaApiReal && lugar.pronosticoSemanal.length === 0) await this.cargarLugares();
    return lugar;
  }

  calcularEstadisticas(pronostico) {
    if (!pronostico?.length) return null;
    let minGlobal = pronostico[0].min, maxGlobal = pronostico[0].max, sumaPromedios = 0;
    const conteoEstados = {};
    for (const dia of pronostico) {
      if (dia.min < minGlobal) minGlobal = dia.min;
      if (dia.max > maxGlobal) maxGlobal = dia.max;
      sumaPromedios += (dia.min + dia.max) / 2;
      conteoEstados[dia.estado] = (conteoEstados[dia.estado] ?? 0) + 1;
    }
    const promedio = Math.round(sumaPromedios / pronostico.length);
    let estadoMasFrecuente = "", maxConteo = 0;
    for (const [e, c] of Object.entries(conteoEstados)) if (c > maxConteo) { maxConteo = c; estadoMasFrecuente = e; }
    const p = maxConteo / pronostico.length;
    let resumen = p >= 0.7 ? `Semana mayormente ${estadoMasFrecuente.toLowerCase()}.`
                : p >= 0.4 ? `Semana con predominio de condiciones ${estadoMasFrecuente.toLowerCase()}.`
                :             "Semana variable, con varios tipos de clima.";
    resumen += promedio > 1000 ? " Temperaturas extremadamente altas: condiciones letales."
             : promedio > 100  ? " Calor abrasador sin posibilidad de vida conocida."
             : promedio > 0    ? " Temperaturas cálidas sobre el punto de congelación."
             : promedio > -50  ? " Semana fría pero con rangos moderados."
             : promedio > -150 ? " Semana muy fría, extremos gélidos."
             :                   " Temperaturas criogénicas: frío extremo.";
    return { min: minGlobal, max: maxGlobal, promedio, conteoEstados, estadoMasFrecuente, resumen };
  }

  generarAlertas(stats) {
    if (!stats) return [];
    const { promedio, conteoEstados } = stats;
    const alertas = [];
    if (promedio > 500)      alertas.push({ emoji: "🔥", texto: "Alerta de calor extremo: temperatura promedio superior a 500 °C.", color: "#fca5a5" });
    else if (promedio > 35)  alertas.push({ emoji: "☀️", texto: "Alerta de calor: temperatura promedio por encima de 35 °C.", color: "#fdba74" });
    if (promedio < -150)     alertas.push({ emoji: "🧊", texto: "Alerta criogénica: temperaturas letalmente bajas toda la semana.", color: "#c4b5fd" });
    else if (promedio < -10) alertas.push({ emoji: "❄️", texto: "Alerta de frío intenso: temperatura promedio bajo cero.", color: "#7dd3fc" });
    const diasLluvia = (conteoEstados["Lluvioso"] ?? 0) + (conteoEstados["Tormenta"] ?? 0);
    if (diasLluvia >= 3) alertas.push({ emoji: "🌧️", texto: `Semana lluviosa: ${diasLluvia} días con lluvia o tormenta.`, color: "#93c5fd" });
    const diasTormenta = Object.entries(conteoEstados).filter(([k]) => k.toLowerCase().includes("tormenta")).reduce((s, [, v]) => s + v, 0);
    if (diasTormenta >= 4 && promedio < 0) alertas.push({ emoji: "🌪️", texto: `Semana de tormentas planetarias: ${diasTormenta} días de actividad extrema.`, color: "#f0abfc" });
    const diasExtremo = (conteoEstados["Plasma"] ?? 0) + (conteoEstados["Magma"] ?? 0) + (conteoEstados["Erupción"] ?? 0);
    if (diasExtremo >= 3) alertas.push({ emoji: "💥", texto: "Actividad extrema detectada: múltiples días de plasma, magma o erupciones.", color: "#fca5a5" });
    if (!alertas.length) alertas.push({ emoji: "✅", texto: "Sin alertas climáticas esta semana.", color: "#86efac" });
    return alertas;
  }

  async renderHome() {
    const grid = document.getElementById("planetas-grid");
    if (!grid) return;
    grid.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-info" role="status"></div><p class="text-white mt-3">Cargando datos del universo…</p></div>`;
    try {
      await this.cargarLugares();
      grid.innerHTML = "";
      for (const lugar of this.lugares) {
        const s = this.colorMap[lugar.modifier] ?? this.colorMap.mild;
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
          <article class="card h-100">
            <img src="${lugar.img}" class="card-img-top" alt="Imagen de ${lugar.nombre}" />
            <div class="card-body text-center">
              <h5 class="titulo-planeta">${lugar.nombre.toUpperCase()}</h5>
              <p>${lugar.desc.substring(0, 100)}…</p>
              <div class="mb-2">
                <span class="badge" style="background:${s.bg};color:${s.color};border:1px solid ${s.border};font-size:0.8rem;padding:4px 10px;border-radius:20px;">
                  ${lugar.formatTemp()} · ${lugar.estadoActual}
                </span>
              </div>
              ${lugar.usaApiReal ? `<span class="badge bg-success mb-2" style="font-size:0.65rem;">🌐 Datos reales</span><br>` : ""}
              <a href="detalle.html?planeta=${lugar.id}" class="btn btn-primary btn-planeta">Ver más</a>
            </div>
          </article>`;
        grid.appendChild(col);
      }
    } catch (err) {
      grid.innerHTML = `<div class="col-12 text-center py-4"><p class="text-danger">⚠️ Error al cargar los datos: ${err.message}</p></div>`;
    }
  }

  async renderDetalle() {
    const planetaId = new URLSearchParams(window.location.search).get("planeta");
    const el = (id) => document.getElementById(id);
    const [nombreEl, imagenEl, descEl, tempEl, breadcrumb, pronosticoContainer, statsContainer] = [
      "nombre-planeta", "imagen-planeta", "descripcion-planeta", "temperatura",
      "breadcrumb-planeta", "pronostico-semanal", "estadisticas-semana",
    ].map(el);
    if (!planetaId || !nombreEl) return;

    if (pronosticoContainer) pronosticoContainer.innerHTML = `<p class="text-white text-center">🔄 Cargando pronóstico…</p>`;
    if (statsContainer)      statsContainer.innerHTML      = `<p class="text-white text-center">🔄 Calculando estadísticas…</p>`;

    let lugar;
    try { lugar = await this.cargarDetalleLugar(planetaId); }
    catch (err) {
      if (pronosticoContainer) pronosticoContainer.innerHTML = `<p class="text-danger text-center">⚠️ Error: ${err.message}</p>`;
      return;
    }
    if (!lugar) {
      if (pronosticoContainer) pronosticoContainer.innerHTML = `<p class="text-warning text-center">Planeta no encontrado.</p>`;
      return;
    }

    // Datos básicos
    nombreEl.textContent = lugar.nombre;
    imagenEl.src = lugar.img; imagenEl.alt = `Imagen de ${lugar.nombre}`;
    descEl.textContent = lugar.desc; tempEl.textContent = lugar.formatTemp();
    const s = this.colorMap[lugar.modifier] ?? this.colorMap.mild;
    Object.assign(tempEl.style, { background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: "20px", padding: "6px 16px", display: "inline-block", fontWeight: "700" });
    if (breadcrumb) breadcrumb.textContent = lugar.nombre;
    document.title = `${lugar.nombre} — Exploración Espacial`;

    if (!lugar.pronosticoSemanal.length) return;

    // Pronóstico semanal
    const apiTag = lugar.usaApiReal ? `<span class="badge bg-success ms-2" style="font-size:0.6rem;vertical-align:middle;">🌐 API real</span>` : "";
    const cards = lugar.pronosticoSemanal.map((dia) => `
      <div class="col-6 col-md-3">
        <div class="text-center p-2" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:12px;">
          <div style="font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${dia.dia}</div>
          <div style="font-size:0.85rem;color:${s.color};margin:4px 0;">${dia.estado}</div>
          <div style="font-size:0.75rem;">
            <span style="color:#fca5a5;">▲ ${dia.max > 0 ? "+" : ""}${dia.max}°</span> &nbsp;
            <span style="color:#7dd3fc;">▼ ${dia.min > 0 ? "+" : ""}${dia.min}°</span>
          </div>
        </div>
      </div>`).join("");
    if (pronosticoContainer) pronosticoContainer.innerHTML = `<h3 class="text-info mb-3" style="font-size:1rem;letter-spacing:2px;text-transform:uppercase;">📅 Pronóstico Semanal ${apiTag}</h3><div class="row g-2">${cards}</div>`;

    // Estadísticas + Alertas
    const stats = this.calcularEstadisticas(lugar.pronosticoSemanal);
    const alertas = this.generarAlertas(stats);
    const conteoHTML = Object.entries(stats.conteoEstados).map(([estado, n]) => `
      <div class="d-flex justify-content-between align-items-center mb-1">
        <span style="color:#94a3b8;font-size:0.85rem;">${estado}</span>
        <span style="color:${s.color};font-weight:700;">${n} ${n === 1 ? "día" : "días"}</span>
      </div>`).join("");
    const alertasHTML = alertas.map((a) => `
      <div class="d-flex align-items-start gap-2 mb-2 p-2" style="background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid ${a.color};">
        <span style="font-size:1.1rem;">${a.emoji}</span>
        <span style="color:${a.color};font-size:0.85rem;">${a.texto}</span>
      </div>`).join("");
    if (statsContainer) statsContainer.innerHTML = `
      <h3 class="text-info mb-3" style="font-size:1rem;letter-spacing:2px;text-transform:uppercase;">📊 Estadísticas de la Semana</h3>
      <div class="row g-3 mb-3">
        <div class="col-4"><div class="text-center p-3" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;">
          <div style="font-size:0.65rem;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Máxima</div>
          <div style="font-size:1.1rem;font-weight:700;color:#fca5a5;">${stats.max > 0 ? "+" : ""}${stats.max}°C</div>
        </div></div>
        <div class="col-4"><div class="text-center p-3" style="background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);border-radius:12px;">
          <div style="font-size:0.65rem;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Mínima</div>
          <div style="font-size:1.1rem;font-weight:700;color:#7dd3fc;">${stats.min > 0 ? "+" : ""}${stats.min}°C</div>
        </div></div>
        <div class="col-4"><div class="text-center p-3" style="background:rgba(129,140,248,0.1);border:1px solid rgba(129,140,248,0.2);border-radius:12px;">
          <div style="font-size:0.65rem;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Promedio</div>
          <div style="font-size:1.1rem;font-weight:700;color:#c4b5fd;">${stats.promedio > 0 ? "+" : ""}${stats.promedio}°C</div>
        </div></div>
      </div>
      <div class="mb-3 p-3" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;">
        <div style="font-size:0.7rem;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Días por tipo de clima</div>
        ${conteoHTML}
      </div>
      <div class="mb-3 p-3" style="background:linear-gradient(135deg,${s.bg},rgba(0,0,0,0.3));border:1px solid ${s.border};border-radius:12px;font-size:0.9rem;color:${s.color};font-style:italic;">
        💬 ${stats.resumen}
      </div>
      <h4 class="text-info mb-2" style="font-size:0.9rem;letter-spacing:2px;text-transform:uppercase;">⚠️ Alertas de Clima</h4>
      ${alertasHTML}`;
  }

  initBtnTemperatura() {
    const btn = document.getElementById("btn-temperatura");
    const box = document.getElementById("temperatura");
    if (!btn || !box) return;
    btn.addEventListener("click", () => {
      box.classList.remove("visible");
      void box.offsetWidth;
      box.classList.add("visible");
      btn.style.display = "none";
    });
  }

  initScrollBtns() {
    document.getElementById("go-to-bottom")?.addEventListener("click", () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
    document.getElementById("go-to-top")?.addEventListener("click",    () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  async init() {
    this.initScrollBtns();
    if (document.getElementById("nombre-planeta")) {
      this.initBtnTemperatura();
      await this.renderDetalle();
    } else {
      await this.renderHome();
    }
  }
}

// Bootstrap
const app = new WeatherApp(new ApiClient());
app.init();