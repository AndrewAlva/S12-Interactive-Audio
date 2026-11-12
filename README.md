# S12-Interactive-Audio
Ejercicios básicos pero completos para integrar audio en la web con Web Audio API: música de fondo, manipulación y efectos de sonido (SFX).

S12 · Jueves 12 de noviembre 2026 · Unidad 1, JavaScript avanzado (audio en la web, async y carga de recursos) · Unidad 5 (accesibilidad).

---

## Cómo correr un ejercicio

Cada carpeta `01-Demo/` o `02-Starter/` es un proyecto de Vite independiente.

```bash
cd 01-Musica-Fondo/02-Starter
npm install
npm run dev
```

Siempre `Ctrl + C` antes de cambiar de ejercicio.

- **`01-Demo`** es la versión terminada: así debe quedar tu starter al final de la práctica.
- **`02-Starter`** es donde trabajas. Los pasos están numerados en `src/main.js` y vamos llenándolos juntos en clase.

---

## Estructura

```
S12-Audio-Web/
├── 01-Musica-Fondo/    cargar · desbloquear con un gesto · loop · mute con rampa
├── 02-Manipular/       mouse → filtro y volumen, con curvas · analizador (extensión)
└── 03-SFX/             una fuente por disparo · detune al azar · límite de disparos
```

En los tres el grafo es el mismo, solo crece:

```
fuente → [filtro] → volumen → [analizador] → destination (bocinas)
```

---

## Las cinco reglas que vas a usar en tu proyecto final

1. **Nada suena sin un gesto.** El `AudioContext` nace `suspended`; se llama `resume()` dentro de un clic. Por eso todo empieza con un botón "Entrar".
2. **Carga antes, dispara después.** `fetch` → `arrayBuffer` → `decodeAudioData` al abrir la página, nunca en el momento del clic.
3. **Una fuente se usa una sola vez.** El buffer (el archivo) se reusa; la fuente (`createBufferSource`) se crea cada vez que suena.
4. **Nunca cambies el volumen de golpe.** Un salto a 0 hace "pop". Usa rampas: `setTargetAtTime` o `linearRampToValueAtTime`.
5. **El oído no es lineal.** Para volumen y frecuencia, mapea con curva (cuadrado o exponencial), no en línea recta.

---

## Si algo no funciona

| Síntoma | Causa probable |
|---|---|
| No suena nada y no hay error | El `AudioContext` sigue en `suspended`: falta `resume()` en el clic. |
| `Failed to execute 'start'` | Llamaste `start()` dos veces en la misma fuente. Crea una nueva. |
| El botón "Entrar" nunca se habilita | `cargarAudio()` no devuelve el buffer, o la ruta del archivo está mal (revisa la pestaña Network). |
| Suena un clic al silenciar | Asignaste `gain.value = 0` directo. Usa rampa. |
| El filtro no cambia nada | La fuente está conectada a `destination` y no al filtro. |
| Muchos sonidos encimados en el hover | Falta el límite de tiempo entre disparos (paso 5 del ejercicio 03). |

---

## Créditos de audio

Los tres archivos (`musica-loop.wav`, `sfx-hover.wav`, `sfx-voltear.wav`) se sintetizaron para este curso y se liberan como **CC0**: úsalos como quieras, sin atribución.

Para tu proyecto final, busca audio con licencia y **anota autor, licencia y liga** en un `CREDITOS.md`:

- [Kenney · Audio](https://kenney.nl/assets/category:Audio): paquetes CC0 de interfaz, casino (cartas) e impactos.
- [OpenGameArt](https://opengameart.org/): filtra por licencia CC0. Por ejemplo, [Ambient Relaxing Loop](https://opengameart.org/content/ambient-relaxing-loop), de isaiah658.
- [Freesound](https://freesound.org/): filtra por licencia "Creative Commons 0". Requiere cuenta.

**Formato:** entrega `.m4a` o `.mp3` para que funcione en Safari. Si un loop hace un hueco al repetir, prueba `.wav` corto o recorta con `loopStart` / `loopEnd`.
