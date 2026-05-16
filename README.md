# 🌌 Exploración Espacial — App de Clima

Aplicación web de clima espacial que muestra información meteorológica simulada (y real para la Tierra) de planetas y exoplanetas del sistema solar y más allá.

---

## Descripción

La app permite explorar el "clima" de 12 cuerpos celestes, desde el Sol hasta exoplanetas helados como OGLE-2005-BLG-390Lb. Cada planeta cuenta con:

- Temperatura actual y estado atmosférico.
- Pronóstico semanal (7 días).
- Estadísticas semanales (mínima, máxima, promedio, días por tipo de clima).
- Alertas de clima automáticas.

La **Tierra** obtiene su pronóstico desde la API real de **Open-Meteo** (datos de Santiago de Chile). El resto de los cuerpos utiliza datos simulados científicamente basados en valores reales conocidos.

---

## Estructura de clases

### `ApiClient`
Encapsula toda la comunicación con APIs externas.

| Método | Descripción |
|--------|-------------|
| `get(endpoint)` | Realiza un `fetch` GET y devuelve el JSON parseado. Lanza error si HTTP no es OK. |
| `obtenerPronosticoTierra()` | Consulta Open-Meteo con lat/lng de Santiago y mapea la respuesta a 7 días con `{ dia, min, max, estado }`. |
| `static wmoAEstado(code)` | Convierte códigos WMO (estándar meteorológico) a estados en español. |

### `LugarClima`
Modela un cuerpo celeste con sus propiedades de clima.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | string | Identificador único (usado en la URL). |
| `nombre` | string | Nombre visible. |
| `img` | string | Ruta a la imagen. |
| `desc` | string | Descripción científica. |
| `tempActual` | number | Temperatura actual en °C. |
| `estadoActual` | string | Estado atmosférico actual. |
| `modifier` | string | `hot / warm / mild / cold / frozen` — determina el esquema de color. |
| `pronosticoSemanal` | Array | 7 objetos `{ dia, min, max, estado }`. |
| `usaApiReal` | boolean | `true` si los datos vienen de una API externa. |
| `formatTemp(t?)` | method | Formatea una temperatura con signo `+` cuando corresponde. |

### `WeatherApp`
Clase principal que orquesta toda la aplicación.

| Método | Descripción |
|--------|-------------|
| `_initLugares()` | Crea los 12 objetos `LugarClima` con datos base. |
| `cargarLugares()` | Para la Tierra llama a `apiClient.obtenerPronosticoTierra()`; para los demás devuelve datos locales. Maneja errores con fallback. |
| `cargarDetalleLugar(id)` | Retorna un `LugarClima` por id, recargando si es necesario. |
| `calcularEstadisticas(pronostico)` | Calcula mín., máx., promedio, conteo por estado y resumen textual. |
| `generarAlertas(stats, pronostico)` | Aplica reglas simples y retorna un array de alertas con emoji, texto y color. |
| `renderHome()` | Renderiza el grid de tarjetas en `index.html`, con spinner de carga. |
| `renderDetalle()` | Renderiza pronóstico, estadísticas y alertas en `detalle.html`. |
| `initBtnTemperatura()` | Inicializa el botón "Conocer temperatura actual" con animación. |
| `initScrollBtns()` | Inicializa botones de scroll arriba/abajo. |
| `init()` | Punto de entrada: detecta si es Home o Detalle y llama al render correspondiente. |

---

## API de clima utilizada

**Open-Meteo**
- URL base: `https://api.open-meteo.com/v1/forecast`
- Documentación: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- Sin API key requerida.
- CORS habilitado (funciona desde el navegador).
- Parámetros usados:
  - `latitude=-33.45&longitude=-70.67` (Santiago de Chile)
  - `daily=temperature_2m_max,temperature_2m_min,weathercode`
  - `timezone=America/Santiago&forecast_days=7`
- El código WMO de cada día se convierte a texto español con el método estático `ApiClient.wmoAEstado()`.

---

## Cálculo de estadísticas

Las estadísticas se calculan en `WeatherApp.calcularEstadisticas(pronostico)`:

1. **Temperatura mínima**: el valor `min` más bajo de los 7 días.
2. **Temperatura máxima**: el valor `max` más alto de los 7 días.
3. **Temperatura promedio**: promedio de los promedios diarios `(min + max) / 2`, redondeado.
4. **Conteo por tipo de clima**: objeto `{ estado: cantidad }` construido iterando cada día.
5. **Resumen textual**: combina la proporción del estado más frecuente con un contexto de temperatura.

Las **alertas** se generan en `WeatherApp.generarAlertas()` con estas reglas:

| Regla | Condición | Alerta |
|-------|-----------|--------|
| Calor extremo | promedio > 500 °C | 🔥 Alerta de calor extremo |
| Calor | promedio > 35 °C | ☀️ Alerta de calor |
| Frío criogénico | promedio < -150 °C | 🧊 Alerta criogénica |
| Frío intenso | promedio < -10 °C | ❄️ Alerta de frío intenso |
| Semana lluviosa | ≥ 3 días lluviosos/tormentosos | 🌧️ Semana lluviosa |
| Tormentas planetarias | ≥ 4 días de tormenta + frío | 🌪️ Semana de tormentas planetarias |
| Actividad extrema | ≥ 3 días de plasma/magma/erupción | 💥 Actividad extrema |

---

## Tecnologías

- HTML5 + Bootstrap 5.3
- SCSS (compilado a `main.css`)
- JavaScript ES6+ (clases, `async/await`, `fetch`, template literals, arrow functions, `const/let`, `for...of`, optional chaining `?.`, nullish coalescing `??`)
- API externa: Open-Meteo (sin API key)
---

## Enlace al repositorio

ANGELA IZAGA GOMEZ
> 🔗 https://github.com/angelagoiz/Clima-Planetas-M5

