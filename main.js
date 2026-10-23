/* =========================================================
   ISP Cyber Code Hub
   Web Audio & Access Logic Engine
========================================================= */

// Access Codes
const VALID_CODE = "1234";
const BLACKLIST_CODE = "9999";

// DOM Elements
const terminal = document.getElementById("terminal");
const inputScreen = document.getElementById("input-screen");
const processingScreen = document.getElementById("processing-screen");
const grantedCard = document.getElementById("granted-card");
const deniedCard = document.getElementById("denied-card");
const accessInput = document.getElementById("access-code");
const submitBtn = document.getElementById("submit-btn");

// Web Audio API
const AudioContextClass =
  window.AudioContext || window.webkitAudioContext;

let audioCtx;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  return audioCtx;
}

// Play Access Granted Sound
function playGrantedChime() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  function playTone(frequency, startTime, duration) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  playTone(659.25, now, 0.25);        // E5
  playTone(880, now + 0.15, 0.4);    // A5
}

// Play Access Denied Sound
function playDeniedBuzzer() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(130, now);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.45);
}

// Event Listeners
submitBtn.addEventListener("click", processAccessCode);

accessInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    processAccessCode();
  }
});

// Access Verification
function processAccessCode() {
  const code = accessInput.value.trim();

  if (code === "") {
    alert("Please enter a PIN code first!");
    return;
  }

  // Step 1: Show Processing Screen
  inputScreen.classList.add("hidden");
  processingScreen.classList.remove("hidden");

  // Step 2: Verify PIN After 1 Second
  setTimeout(function () {
    processingScreen.classList.add("hidden");

    if (code === VALID_CODE) {
      playGrantedChime();
      grantedCard.classList.remove("hidden");
    } else {
      playDeniedBuzzer();
      terminal.classList.add("bg-denied");
      deniedCard.classList.remove("hidden");
    }

    // Step 3: Reset After 6 Seconds
    setTimeout(resetTerminal, 6000);
  }, 1000);
}

// Reset Terminal
function resetTerminal() {
  accessInput.value = "";

  terminal.classList.remove("bg-denied");

  grantedCard.classList.add("hidden");
  deniedCard.classList.add("hidden");
  processingScreen.classList.add("hidden");

  inputScreen.classList.remove("hidden");
}