import './style.css';
console.log("03-SFX. 01-Demo.");

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const botonActivar = document.getElementById("activar");
const cartas = document.querySelectorAll(".carta");
const ultimoContainer = document.getElementById("sfx-ultimo");
const detuneContainer = document.getElementById("sfx-detune");
const conteoContainer = document.getElementById("sfx-conteo");
// -------------------------------------------------------------------------



// Definición de variables y constantes ---------------------------------------------------------------
const URL_HOVER = "/audio/sfx-hover.wav";
const URL_VOLTEAR = "/audio/sfx-voltear.wav";

const VARIACION = 150;       // cents (100 = un semitono) de variación al azar
const ESPERA_HOVER = 80;     // ms mínimos entre dos sonidos de hover

let audioContext;
let volumenSFX;
let sonidos = {};            // los buffers ya decodificados, por nombre
let ultimoHover = 0;         // cuándo sonó el último hover
let conteo = 0;              // cuántas fuentes hemos creado
// -------------------------------------------------------------------------






// Funciones de utilidad ---------------------------------------------------------------
// aleatorio(): un número al azar entre min y max
function aleatorio(min, max) {
  return min + Math.random() * (max - min);
}
// -------------------------------------------------------------------------






// Audio: cargar todos los sonidos antes de empezar ---------------------------------------------------------------
audioContext = new AudioContext();
volumenSFX = audioContext.createGain();
volumenSFX.gain.value = 0.7;
volumenSFX.connect(audioContext.destination);

async function cargarAudio(url) {
  const respuesta = await fetch(url);
  const bytes = await respuesta.arrayBuffer();
  return audioContext.decodeAudioData(bytes);
}

// 1 · Promise.all: espera a que TODOS estén listos (así ninguno llega tarde al primer clic)
Promise.all([cargarAudio(URL_HOVER), cargarAudio(URL_VOLTEAR)]).then(([hover, voltear]) => {
  sonidos.hover = hover;
  sonidos.voltear = voltear;
  botonActivar.disabled = false;
});

botonActivar.addEventListener("click", async () => {
  await audioContext.resume();
  document.body.classList.add("dentro");
});
// -------------------------------------------------------------------------






// Disparar un sonido ---------------------------------------------------------------
function reproducir(nombre, variacion = 0) {
  // 2 · Una fuente NUEVA cada vez: una fuente solo se puede usar una vez.
  //     El buffer sí se reusa: es el archivo, ya decodificado.
  const fuente = audioContext.createBufferSource();
  fuente.buffer = sonidos[nombre];

  // 3 · Extensión · detune al azar: el mismo sonido, un poco más agudo o grave cada vez
  const detune = aleatorio(-variacion, variacion);
  fuente.detune.value = detune;

  fuente.connect(volumenSFX);
  fuente.start();

  conteo++;
  ultimoContainer.innerText = nombre;
  detuneContainer.innerText = `${Math.round(detune)} cents`;
  conteoContainer.innerText = conteo;
}
// -------------------------------------------------------------------------






// Interacciones ---------------------------------------------------------------
cartas.forEach((carta) => {
  // 4 · Hover: sonido corto
  carta.addEventListener("mouseenter", () => {
    // 5 · Extensión · si pasas rápido sobre muchas cartas, no dispares 20 sonidos encimados
    const ahora = performance.now();
    if (ahora - ultimoHover < ESPERA_HOVER) return;
    ultimoHover = ahora;

    reproducir("hover", VARIACION);
  });

  // 6 · Clic: voltear la carta y su sonido
  carta.addEventListener("click", () => {
    carta.classList.toggle("volteada");
    reproducir("voltear", VARIACION / 2);
  });
});
// -------------------------------------------------------------------------
