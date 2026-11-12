import './style.css';
console.log("01-Musica-Fondo. 01-Demo.");

// Obtener referencias a los elementos del DOM ---------------------------------------------------------------
const botonEntrar = document.getElementById("entrar");
const botonMute = document.getElementById("mute");
const estadoContainer = document.getElementById("audio-estado");
const cargaContainer = document.getElementById("audio-carga");
const volumenContainer = document.getElementById("audio-volumen");
// -------------------------------------------------------------------------



// Definición de variables y constantes ---------------------------------------------------------------
const URL_MUSICA = "/audio/musica-loop.wav";
const VOLUMEN = 0.6;          // 0 silencio · 1 volumen original
const DURACION_FADE = 2;      // segundos que tarda en subir el volumen al entrar

let audioContext;             // el "estudio" donde vive todo el audio
let volumenMaster;            // GainNode: la perilla de volumen general
let musicaBuffer;             // el archivo ya decodificado (el "clip")
let musicaFuente;             // quien reproduce el buffer (se crea una sola vez)
let silenciado = false;
// -------------------------------------------------------------------------






// Audio: preparar el grafo ---------------------------------------------------------------
// 1 · Crear el AudioContext. Nace "suspended": el navegador no deja sonar nada sin un gesto.
audioContext = new AudioContext();

// 2 · Crear el volumen general y conectarlo a la salida (las bocinas)
//     musicaFuente → volumenMaster → destination
volumenMaster = audioContext.createGain();
volumenMaster.gain.value = 0;             // empieza en silencio: el fade lo sube
volumenMaster.connect(audioContext.destination);

// 3 · Cargar el archivo: descargar → bytes → decodificar
async function cargarAudio(url) {
  const respuesta = await fetch(url);
  const bytes = await respuesta.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(bytes);
  return buffer;
}

cargarAudio(URL_MUSICA).then((buffer) => {
  musicaBuffer = buffer;
  cargaContainer.innerText = `listo • ${buffer.duration.toFixed(1)} s`;
  botonEntrar.disabled = false;
});
// -------------------------------------------------------------------------






// Entrar: el gesto que desbloquea el audio ---------------------------------------------------------------
botonEntrar.addEventListener("click", async () => {
  // 4 · resume(): ahora sí, el usuario hizo clic
  await audioContext.resume();

  reproducirMusica();

  // 5 · Fade-in: de 0 al volumen elegido en DURACION_FADE segundos
  const ahora = audioContext.currentTime;
  volumenMaster.gain.setValueAtTime(0, ahora);
  volumenMaster.gain.linearRampToValueAtTime(VOLUMEN, ahora + DURACION_FADE);

  document.body.classList.add("dentro");
});

function reproducirMusica() {
  // 6 · Una fuente nueva que lee el buffer, en loop, conectada al volumen
  musicaFuente = audioContext.createBufferSource();
  musicaFuente.buffer = musicaBuffer;
  musicaFuente.loop = true;
  musicaFuente.connect(volumenMaster);
  musicaFuente.start();
}
// -------------------------------------------------------------------------






// Mute: bajar el volumen con rampa, nunca de golpe ---------------------------------------------------------------
botonMute.addEventListener("click", () => {
  silenciado = !silenciado;

  // 7 · setTargetAtTime: se acerca al valor en ~0.1 s. Cortar a 0 de golpe hace "pop".
  const destino = silenciado ? 0 : VOLUMEN;
  volumenMaster.gain.setTargetAtTime(destino, audioContext.currentTime, 0.1);

  botonMute.innerText = silenciado ? "Activar sonido" : "Silenciar";
});
// -------------------------------------------------------------------------






// Extensión · pausar cuando la pestaña no se ve ---------------------------------------------------------------
document.addEventListener("visibilitychange", () => {
  if (!document.body.classList.contains("dentro")) return;
  if (document.hidden) audioContext.suspend();
  else audioContext.resume();
});
// -------------------------------------------------------------------------






// Loop: solo lee y escribe en el DOM ---------------------------------------------------------------
function animate() {
  estadoContainer.innerText = audioContext.state;
  volumenContainer.innerText = volumenMaster.gain.value.toFixed(2);

  requestAnimationFrame(animate);
}

animate();
// -------------------------------------------------------------------------
