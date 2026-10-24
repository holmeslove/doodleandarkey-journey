// =====================================================
//  Doodle and Arkey's Journey
//  The opening story: the secret lab, the escape, and "A few years later..."
// =====================================================

// ---------- Canvas setup ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// The story is laid out on a 960 x 540 grid. The canvas itself is resized to fill
// the browser window, and draw() scales the grid to match.
const WIDTH = 960;
const HEIGHT = 540;

// ---------- Settings (change these to change how the story feels) ----------
const STEP_TIME = 1000 / 60;   // milliseconds per game step
const FLOOR_Y = 440;           // the lab floor, where feet stand
const TUBE_X = 430;            // centre of the test tube
const ARKEY_H = 190;           // Arkey's height (his width follows his picture's shape)
const DOODLE_H = 120;          // Doodle's height
const WALK_SPEED = 2.4;        // how fast Arkey and Doodle walk
const ARKEY_ENTER_X = WIDTH + 160;     // Arkey starts just off the right side of the screen
const SMASH_TRIGGER_X = TUBE_X + 150;  // Arkey smashes the tube when he gets this close
const SMASH_FRAMES = 150;      // the smash picture stays up for 2.5 seconds
const GRAVITY = 0.5;
const DOODLE_FALL_START_Y = FLOOR_Y - 170;  // Doodle starts his fall inside the tube
const ARKEY_JUMP = -9;         // Arkey hops down off the tube and lands on the ground
const PAUSE_FRAMES = 45;       // a short pause after they land, before they walk off
const FADE_FRAMES = 60;        // how long the screen takes to fade to black
const TEXT_IN_FRAMES = 40;     // "A few years later..." fades in...
const TEXT_HOLD_FRAMES = 240;  // ...stays for 4 seconds...
const TEXT_OUT_FRAMES = 40;    // ...and fades out
const TIMES_FADE_FRAMES = 90;  // Times Square fades in from black

// ---------- Image files ----------
// Put your PNG files in the "assets" folder using these names.
// If a file is missing, the story draws a simple shape instead.
const IMAGE_FILES = {
  titleBackground: "assets/doodle-and-arky-journey.png",
  doodleInTestTube: "assets/doodle-in-test-tube.png",
  arkeyFreeingDoodle: "assets/arkey-freeing-doodle.png",
  arkeyFlashlight: "assets/arkey-moving-with-flashlight.png",
  doodleFalling: "assets/doodle-falling.png",
  testTubeBroken: "assets/test-tube-broken.png",
  doodleWithoutAccessories: "assets/doodle-without-accessories.png",
  doodleSideWithoutAccessories: "assets/doodle-side-without-accessories.png",
  scene2Background: "assets/scene-2-background.png"
};

const images = {};

function loadImages() {
  for (const name in IMAGE_FILES) {
    const img = new Image();
    img.src = IMAGE_FILES[name];
    images[name] = img;
  }
}

// True only if the PNG file was found and loaded
function imageReady(name) {
  const img = images[name];
  return img && img.complete && img.naturalWidth > 0;
}

// ---------- Settings sliders (title screen, saved in the browser) ----------
const SAVE_KEY_MUSIC_VOLUME = "doodleandarkey.musicVolume";
const SAVE_KEY_SOUND_VOLUME = "doodleandarkey.soundVolume";
const SAVE_KEY_DARKNESS = "doodleandarkey.backgroundDarkness";
const MAX_BACKGROUND_DARKNESS = 0.8;   // 0 is normal brightness, 0.8 is very dark
let musicVolume = 4;     // 0 to 10, 4 is the normal music level
let soundVolume = 6;     // 0 to 10, 6 is the normal sound effect level
let backgroundDarkness = 0;

function loadSettings() {
  try {
    const savedMusic = parseInt(localStorage.getItem(SAVE_KEY_MUSIC_VOLUME), 10);
    const savedSound = parseInt(localStorage.getItem(SAVE_KEY_SOUND_VOLUME), 10);
    const savedDarkness = parseFloat(localStorage.getItem(SAVE_KEY_DARKNESS));
    if (savedMusic >= 0 && savedMusic <= 10) musicVolume = savedMusic;
    if (savedSound >= 0 && savedSound <= 10) soundVolume = savedSound;
    if (savedDarkness >= 0 && savedDarkness <= MAX_BACKGROUND_DARKNESS) backgroundDarkness = savedDarkness;
  } catch (err) {
    // Storage is blocked: use the normal settings
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SAVE_KEY_MUSIC_VOLUME, String(musicVolume));
    localStorage.setItem(SAVE_KEY_SOUND_VOLUME, String(soundVolume));
    localStorage.setItem(SAVE_KEY_DARKNESS, String(backgroundDarkness));
  } catch (err) {
    // Storage is blocked: the settings still work until the page is closed
  }
}

// ---------- Story state ----------
// gameState is "title" (the start screen) or "story" (the opening sequence).
// phase says which part of the story is playing, and phaseTime counts frames in it.
let gameState = "title";
let phase = "title";
let phaseTime = 0;
let frameCount = 0;      // keeps the lab's flicker, fog and dust moving

// Arkey and Doodle. x is the centre, y is the bottom (where feet touch the floor).
let arkey = null;
let doodle = null;

// ---------- Helpers ----------
function setPhase(next) {
  phase = next;
  phaseTime = 0;
}

// Draws a picture with its bottom on bottomY, keeping its shape. Returns false if the picture is missing.
function drawSprite(name, centerX, bottomY, height, flip) {
  if (!imageReady(name)) return false;
  const img = images[name];
  const width = height * img.naturalWidth / img.naturalHeight;
  ctx.save();
  ctx.translate(centerX, bottomY - height);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -width / 2, 0, width, height);
  ctx.restore();
  return true;
}

// Draws a picture if it exists, or a plain coloured box in its place
function drawActor(name, centerX, bottomY, height, flip, color) {
  if (!drawSprite(name, centerX, bottomY, height, flip)) {
    ctx.fillStyle = color;
    ctx.fillRect(centerX - height * 0.2, bottomY - height, height * 0.4, height);
  }
}

// Fills the whole screen with a picture, cropped to fit (like CSS object-fit: cover)
function drawCover(name) {
  if (!imageReady(name)) return false;
  const img = images[name];
  const scale = Math.max(WIDTH / img.naturalWidth, HEIGHT / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
  return true;
}

// The background darkness setting, applied over the story backgrounds
function applyBackgroundDarkness() {
  if (backgroundDarkness <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${backgroundDarkness})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function fillBlack(alpha) {
  if (alpha <= 0) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(alpha, 1)})`;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Doodle uses the side picture while walking right, if it exists
function doodleWalkPicture() {
  return imageReady("doodleSideWithoutAccessories") ? "doodleSideWithoutAccessories" : "doodleWithoutAccessories";
}

// ---------- Falling and landing ----------
// Moves an actor down to the floor under gravity. It bounces twice (a small hop the second time) and then stays.
function fallToFloor(actor) {
  if (actor.landed) return;
  actor.vy += GRAVITY;
  actor.y += actor.vy;
  if (actor.y >= FLOOR_Y) {
    actor.y = FLOOR_Y;
    actor.bounces++;
    if (actor.bounces > 1 || Math.abs(actor.vy) < 2) {
      actor.landed = true;
      actor.vy = 0;
    } else {
      actor.vy = -actor.vy * 0.3;
    }
  }
}

// ---------- Story start ----------
// Pressing Play (or Space / Enter) starts the story in the dark lab, with only the test tube showing
function startStory() {
  if (gameState !== "title") return;
  gameState = "story";
  setMenuVisible(false);
  arkey = { x: ARKEY_ENTER_X, y: FLOOR_Y, vy: 0, facingLeft: true, landed: true, bounces: 0 };
  doodle = { x: TUBE_X, y: DOODLE_FALL_START_Y, vy: 0, landed: false, bounces: 0 };
  setPhase("approach");
}

// Arkey smashes the tube: Doodle falls out, and Arkey hops down to the ground
function startDrop() {
  doodle = { x: TUBE_X, y: DOODLE_FALL_START_Y, vy: 0, landed: false, bounces: 0 };
  arkey.y = FLOOR_Y;
  arkey.vy = ARKEY_JUMP;
  arkey.landed = false;
  arkey.bounces = 0;
  arkey.facingLeft = false;   // Arkey turns to face the way out
  setPhase("drop");
}

function setMenuVisible(isVisible) {
  const menu = document.getElementById("menu");
  menu.classList.toggle("visible", isVisible);
  menu.classList.toggle("hidden", !isVisible);
}

// ---------- Update (one step of the story) ----------
function update() {
  frameCount++;
  if (gameState !== "story") return;
  phaseTime++;

  switch (phase) {
    case "approach":
      // Arkey walks in from off the right side, carrying his flashlight
      arkey.x -= WALK_SPEED;
      if (arkey.x <= SMASH_TRIGGER_X) setPhase("smash");
      break;

    case "smash":
      // The smash picture covers the screen for a moment
      if (phaseTime >= SMASH_FRAMES) startDrop();
      break;

    case "drop":
      fallToFloor(doodle);
      fallToFloor(arkey);
      if (doodle.landed && arkey.landed) setPhase("pause");
      break;

    case "pause":
      if (phaseTime >= PAUSE_FRAMES) setPhase("walk");
      break;

    case "walk":
      // They escape together out the right side
      doodle.x += WALK_SPEED;
      arkey.x += WALK_SPEED;
      if (doodle.x > WIDTH + 120 && arkey.x > WIDTH + 120) setPhase("fade");
      break;

    case "fade":
      if (phaseTime >= FADE_FRAMES) setPhase("text");
      break;

    case "text":
      if (phaseTime >= TEXT_IN_FRAMES + TEXT_HOLD_FRAMES + TEXT_OUT_FRAMES) setPhase("times");
      break;

    case "times":
      // Times Square stays up. The next scenes come later.
      break;
  }
}

// ---------- Drawing: the secret lab ----------
// Ink-black room, lit only by a faint blue glow around the test tube
function drawLab() {
  const room = ctx.createRadialGradient(TUBE_X, 120, 40, TUBE_X, 260, 640);
  room.addColorStop(0, "#0a1538");
  room.addColorStop(0.55, "#040a1e");
  room.addColorStop(1, "#010208");
  ctx.fillStyle = room;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Fog drifts slowly across the room
  for (let i = 0; i < 3; i++) {
    const x = ((frameCount * 0.12 * (i + 1) + i * 380) % (WIDTH + 500)) - 250;
    const y = 240 + i * 70;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(2.6, 1);
    const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, 120);
    fog.addColorStop(0, "rgba(40, 70, 160, 0.14)");
    fog.addColorStop(1, "rgba(40, 70, 160, 0)");
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // The floor catches a little light, then fades into the dark
  const floor = ctx.createLinearGradient(0, FLOOR_Y, 0, HEIGHT);
  floor.addColorStop(0, "#0c1734");
  floor.addColorStop(1, "#000005");
  ctx.fillStyle = floor;
  ctx.fillRect(0, FLOOR_Y, WIDTH, HEIGHT - FLOOR_Y);
  ctx.fillStyle = "rgba(90, 140, 255, 0.15)";
  ctx.fillRect(0, FLOOR_Y, WIDTH, 2);

  // A dim, flickering ceiling light. It only flashes now and then.
  const flicker = Math.sin(frameCount * 0.07) + Math.sin(frameCount * 0.23);
  if (flicker > 1.1) {
    const cone = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
    cone.addColorStop(0, "rgba(160, 200, 255, 0.10)");
    cone.addColorStop(1, "rgba(160, 200, 255, 0)");
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(TUBE_X + 260, 0);
    ctx.lineTo(TUBE_X + 80, FLOOR_Y);
    ctx.lineTo(TUBE_X + 440, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
  }

  // Dust specks float up through the dark
  ctx.fillStyle = "rgba(200, 220, 255, 0.35)";
  for (let i = 0; i < 30; i++) {
    const x = (i * 137 + frameCount * 0.1 * (1 + (i % 3))) % WIDTH;
    const y = (i * 71) % HEIGHT + Math.sin(frameCount * 0.02 + i) * 10;
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A soft glow that pulses around the test tube
function drawTubeGlow() {
  const pulse = 0.22 + 0.04 * Math.sin(frameCount * 0.05);
  const glow = ctx.createRadialGradient(TUBE_X, FLOOR_Y - 140, 10, TUBE_X, FLOOR_Y - 140, 260);
  glow.addColorStop(0, `rgba(70, 150, 255, ${pulse})`);
  glow.addColorStop(1, "rgba(70, 150, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Arkey's flashlight lights up the room around him
function drawFlashlightGlow() {
  const glowX = arkey.x - (arkey.facingLeft ? 30 : -30);
  const glowY = arkey.y - ARKEY_H * 0.6;
  const glow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 240);
  glow.addColorStop(0, "rgba(255, 240, 170, 0.18)");
  glow.addColorStop(1, "rgba(255, 240, 170, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// Darkens the edges of the screen, so the eye goes to the middle
function drawVignette() {
  const edge = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 200, WIDTH / 2, HEIGHT / 2, 640);
  edge.addColorStop(0, "rgba(0, 0, 0, 0)");
  edge.addColorStop(1, "rgba(0, 0, 0, 0.85)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// The test tube before it breaks. Doodle is inside it.
function drawIntactTube() {
  if (drawSprite("doodleInTestTube", TUBE_X, FLOOR_Y, 280, false)) return;

  // Placeholder until doodle-in-test-tube.png exists: a glass tube with a blue Doodle inside
  const top = FLOOR_Y - 280;
  ctx.fillStyle = "rgba(120, 190, 255, 0.12)";
  ctx.strokeStyle = "rgba(170, 220, 255, 0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(TUBE_X - 55, top, 110, 280, 50);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#00a8e8";
  ctx.beginPath();
  ctx.arc(TUBE_X, FLOOR_Y - 110, 40, 0, Math.PI * 2);
  ctx.fill();
}

// The broken, empty test tube after Arkey smashes it
function drawBrokenTube() {
  drawSprite("testTubeBroken", TUBE_X, FLOOR_Y, 150, false);
}

// Doodle, falling out of the tube, then standing (or walking) without his accessories
function drawDoodle() {
  if (!doodle.landed) {
    drawActor("doodleFalling", doodle.x, doodle.y, DOODLE_H, false, "#00a8e8");
    return;
  }
  const walking = phase === "walk";
  const picture = walking ? doodleWalkPicture() : "doodleWithoutAccessories";
  drawActor(picture, doodle.x, doodle.y, DOODLE_H, false, "#00a8e8");
}

// Arkey with his flashlight. He faces left when he walks in, then right when he leaves.
function drawArkey() {
  drawActor("arkeyFlashlight", arkey.x, arkey.y, ARKEY_H, arkey.facingLeft, "#ffd400");
}

// The lab scene (everything except the smash picture, the Times Square scene and the text)
function drawLabScene() {
  drawLab();
  applyBackgroundDarkness();
  if (phase === "approach" || phase === "drop" || phase === "pause" || phase === "walk") {
    drawTubeGlow();
    drawFlashlightGlow();
  }

  if (phase === "approach") drawIntactTube();
  else drawBrokenTube();

  if (phase !== "approach") drawDoodle();
  drawArkey();

  drawVignette();
}

// Arkey smashes the test tube: the whole screen becomes the smash picture
function drawSmashScene() {
  if (!drawCover("arkeyFreeingDoodle")) {
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  applyBackgroundDarkness();

  // A quick flash as the glass breaks
  if (phaseTime < 12) {
    ctx.fillStyle = `rgba(255, 255, 255, ${1 - phaseTime / 12})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

// Times Square: scene-2-background.png, faded in from black
function drawTimesSquare() {
  if (!drawCover("scene2Background")) {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  applyBackgroundDarkness();
  fillBlack(1 - phaseTime / TIMES_FADE_FRAMES);
}

// "A few years later..." on a black screen
function drawFewYearsLater() {
  const fadeIn = Math.min(phaseTime / TEXT_IN_FRAMES, 1);
  const holdEnd = TEXT_IN_FRAMES + TEXT_HOLD_FRAMES;
  const fadeOut = phaseTime < holdEnd ? 1 : 1 - (phaseTime - holdEnd) / TEXT_OUT_FRAMES;
  const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#dfe8ff";
  ctx.font = "italic 42px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(120, 160, 255, 0.6)";
  ctx.shadowBlur = 14;
  ctx.fillText("A few years later...", WIDTH / 2, HEIGHT / 2);
  ctx.restore();
}

// ---------- Draw ----------
function draw() {
  // Scale the 960 x 540 grid to the canvas size
  ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (gameState === "title") {
    if (!drawCover("titleBackground")) {
      ctx.fillStyle = "#0a1538";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    return;
  }

  switch (phase) {
    case "smash":
      drawSmashScene();
      break;

    case "times":
      drawTimesSquare();
      break;

    case "text":
      fillBlack(1);
      drawFewYearsLater();
      break;

    case "fade":
      drawLabScene();
      fillBlack(phaseTime / FADE_FRAMES);
      break;

    default:
      drawLabScene();
  }
}

// ---------- Keyboard and buttons ----------
document.addEventListener("keydown", (e) => {
  if (e.code !== "Space" && e.code !== "Enter") return;
  // Space on a slider should move the slider, not start the story
  if (e.target && e.target.type === "range") return;

  if (gameState === "title") {
    e.preventDefault();   // stops the same key press from also clicking the Play button
    startStory();
  }
});

document.getElementById("play-button").addEventListener("click", startStory);

// ---------- Settings sliders ----------
const musicSlider = document.getElementById("music-slider");
const soundSlider = document.getElementById("sound-slider");
const darknessSlider = document.getElementById("darkness-slider");

musicSlider.addEventListener("input", () => {
  musicVolume = Number(musicSlider.value);
  saveSettings();
});

soundSlider.addEventListener("input", () => {
  soundVolume = Number(soundSlider.value);
  saveSettings();
});

darknessSlider.addEventListener("input", () => {
  backgroundDarkness = darknessSlider.value / 100;
  saveSettings();
});

// ---------- Fitting the story to the screen ----------
const gameContainer = document.getElementById("game-container");

// Fit the 960 x 540 picture inside the window with its proportions kept (no stretching)
function resizeCanvas() {
  const scale = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);
  const cssWidth = Math.floor(WIDTH * scale);
  const cssHeight = Math.floor(HEIGHT * scale);

  // Draw at the screen's sharpness (phones are often 2 or 3 times sharper)
  const sharpness = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * sharpness);
  canvas.height = Math.round(cssHeight * sharpness);
  gameContainer.style.width = cssWidth + "px";
  gameContainer.style.height = cssHeight + "px";
}

window.addEventListener("resize", resizeCanvas);

// ---------- Main loop ----------
let lastFrameTime = null;
let timeBank = 0;   // time not yet used up by story steps

function gameLoop(now) {
  if (lastFrameTime === null) lastFrameTime = now;

  // Long pauses (like a hidden tab) are capped so the story doesn't rush ahead
  timeBank += Math.min(now - lastFrameTime, 250);
  lastFrameTime = now;

  while (timeBank >= STEP_TIME) {
    update();
    timeBank -= STEP_TIME;
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// ---------- Start up ----------
loadSettings();
musicSlider.value = musicVolume;
soundSlider.value = soundVolume;
darknessSlider.value = Math.round(backgroundDarkness * 100);

loadImages();
resizeCanvas();
requestAnimationFrame(gameLoop);
