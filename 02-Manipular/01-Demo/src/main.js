import './style.css';
console.log("02-Manipular. 01-Demo.");

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const botonActivar = document.getElementById("activar");
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
// fuente → filtro → volumen → analizador → destination
audioContext = new AudioContext();

// 1 · Filtro lowpass: corta los agudos arriba de "frequency"
filtro = audioContext.createBiquadFilter();
filtro.type = "lowpass";
filtro.frequency.value = FRECUENCIA_MAX;

// 2 · Volumen
volumen = audioContext.createGain();
volumen.gain.value = VOLUMEN_MAX / 2;

// Extensión · analizador
analizador = audioContext.createAnalyser();
analizador.fftSize = 512;
datosOnda = new Uint8Array(analizador.fftSize);

// 3 · Conectar en orden
filtro.connect(volumen);
volumen.connect(analizador);
analizador.connect(audioContext.destination);

async function cargarAudio(url) {
  const respuesta = await fetch(url);
  const bytes = await respuesta.arrayBuffer();
  return audioContext.decodeAudioData(bytes);
}

cargarAudio(URL_MUSICA).then((buffer) => {
  musicaBuffer = buffer;
  botonActivar.disabled = false;
});

botonActivar.addEventListener("click", async () => {
  await audioContext.resume();

  const fuente = audioContext.createBufferSource();
  fuente.buffer = musicaBuffer;
  fuente.loop = true;
  fuente.connect(filtro);      // la fuente entra al filtro, no directo a las bocinas
  fuente.start();

  document.body.classList.add("dentro");
});
// -------------------------------------------------------------------------






// Mouse: solo guardar (el loop decide qué hacer con el número) ---------------------------------------------------------------
document.addEventListener("mousemove", (eventData) => {
  // 4 · normalizar de píxeles a 0–1
  mouse.x = map(eventData.clientX, 0, window.innerWidth, 0, 1);
  mouse.y = map(eventData.clientY, window.innerHeight, 0, 0, 1);   // invertido: arriba = 1
});
// -------------------------------------------------------------------------






// Loop de animación ---------------------------------------------------------------
function animate() {
  const ahora = audioContext.currentTime;

  // 5 · X → frecuencia, con curva exponencial.
  //     El oído no es lineal: de 200 a 400 Hz se oye igual de "grande" que de 6000 a 12000.
  const frecuencia = FRECUENCIA_MIN * Math.pow(FRECUENCIA_MAX / FRECUENCIA_MIN, mouse.x);
  filtro.frequency.setTargetAtTime(frecuencia, ahora, SUAVIZADO);

  // 6 · Y → volumen, también con curva (al cuadrado) para que el slider se sienta parejo
  const nivel = Math.pow(clamp(mouse.y, 0, 1), 2) * VOLUMEN_MAX;
  volumen.gain.setTargetAtTime(nivel, ahora, SUAVIZADO);

  // Extensión · el analizador dice qué tan fuerte suena AHORA → escala del círculo
  analizador.getByteTimeDomainData(datosOnda);
  let pico = 0;
  for (let i = 0; i < datosOnda.length; i++) {
    pico = Math.max(pico, Math.abs(datosOnda[i] - 128) / 128);   // 128 = silencio
  }
  circulo.style.transform = `translate(-50%, -50%) scale(${map(pico, 0, 1, 0.4, 1.6)})`;

  mouseXContainer.innerText = mouse.x.toFixed(2);
  frecuenciaContainer.innerText = `${Math.round(frecuencia)} Hz`;
  mouseYContainer.innerText = mouse.y.toFixed(2);
  volumenContainer.innerText = nivel.toFixed(2);

  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
