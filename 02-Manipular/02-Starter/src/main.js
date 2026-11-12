import './style.css';
console.log("02-Manipular. 02-Starter.");

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const botonEntrar = document.getElementById("entrar");
const mouseXContainer = document.getElementById("mouse-x");
const frecuenciaContainer = document.getElementById("audio-frecuencia");
const mouseYContainer = document.getElementById("mouse-y");
const volumenContainer = document.getElementById("audio-volumen");
const circulo = document.getElementById("circulo");
// -------------------------------------------------------------------------



// Definición de variables y constantes ---------------------------------------------------------------
const URL_MUSICA = "/audio/musica-loop.wav";

const FRECUENCIA_MIN = 200;     // Hz: muy apagado, como detrás de una pared
const FRECUENCIA_MAX = 12000;   // Hz: abierto, se oye todo
const VOLUMEN_MAX = 0.8;
const SUAVIZADO = 0.05;         // segundos que tarda un parámetro en alcanzar su destino

let mouse = {
  x: 0.5,   // 0 izquierda · 1 derecha
  y: 0.5    // 0 abajo · 1 arriba
};

let audioContext;
let musicaBuffer;
let filtro;        // BiquadFilterNode: deja pasar solo lo grave
let volumen;       // GainNode
let analizador;    // AnalyserNode: "escucha" el audio para dibujarlo (extensión)
let datosOnda;     // donde el analizador escribe la forma de onda
// -------------------------------------------------------------------------






// Funciones de utilidad ---------------------------------------------------------------
// map(): convierte un valor de un rango a otro
function map(valor, inMin, inMax, outMin, outMax) {
  const t = (valor - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// clamp(): mantiene un valor entre un mínimo y un máximo
function clamp(valor, min, max) {
  return Math.min(max, Math.max(min, valor));
}
// -------------------------------------------------------------------------






// Audio: preparar el grafo ---------------------------------------------------------------
// fuente → filtro → volumen → destination
// (esto ya lo hicimos en el ejercicio 01: cargar y entrar ya vienen resueltos)
audioContext = new AudioContext();

// 1 · Filtro lowpass: corta los agudos arriba de "frequency"


// 2 · Volumen


// Extensión · analizador (fftSize = 512 y un Uint8Array del mismo tamaño)


// 3 · Conectar en orden


async function cargarAudio(url) {
  const respuesta = await fetch(url);
  const bytes = await respuesta.arrayBuffer();
  return audioContext.decodeAudioData(bytes);
}

cargarAudio(URL_MUSICA).then((buffer) => {
  musicaBuffer = buffer;
  botonEntrar.disabled = false;
});

botonEntrar.addEventListener("click", async () => {
  await audioContext.resume();

  const fuente = audioContext.createBufferSource();
  fuente.buffer = musicaBuffer;
  fuente.loop = true;
  fuente.connect(audioContext.destination);   // TODO: conéctala al filtro, no directo a las bocinas
  fuente.start();

  document.body.classList.add("dentro");
});
// -------------------------------------------------------------------------






// Mouse: solo guardar (el loop decide qué hacer con el número) ---------------------------------------------------------------
document.addEventListener("mousemove", (eventData) => {
  // 4 · normalizar de píxeles a 0–1 (Y invertido: arriba = 1)

});
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
function animate() {
  const ahora = audioContext.currentTime;

  // 5 · X → frecuencia, con curva exponencial.
  //     El oído no es lineal: de 200 a 400 Hz se oye igual de "grande" que de 6000 a 12000.
  //     Pista: FRECUENCIA_MIN * Math.pow(FRECUENCIA_MAX / FRECUENCIA_MIN, mouse.x)


  // 6 · Y → volumen, también con curva (al cuadrado) para que el slider se sienta parejo


  // Extensión · el analizador dice qué tan fuerte suena AHORA → escala del círculo
  //     getByteTimeDomainData() llena el arreglo; 128 es silencio, 0 y 255 los extremos.


  mouseXContainer.innerText = mouse.x.toFixed(2);
  mouseYContainer.innerText = mouse.y.toFixed(2);

  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
