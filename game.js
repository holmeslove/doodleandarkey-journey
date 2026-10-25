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
const TUBE_H = 280;            // the test tube's height (its width follows its picture's shape)
const DOODLE_IN_TUBE_H = 94;   // Doodle's height while he is trapped in the tube (15% smaller)
const ARKEY_H = 190;           // Arkey's height (his width follows his picture's shape)
const DOODLE_H = 102;          // Doodle's height once he is out (15% smaller)
const WALK_SPEED = 2.4;        // how fast Arkey and Doodle walk
const ARKEY_ENTER_X = WIDTH + 160;     // Arkey starts just off the right side of the screen
const HIT_X = TUBE_X + 150;    // Arkey stands this far right of the tube and swings at it
const HIT_FRAMES = [60, 150, 240];     // the three hits, counted from when Arkey arrives (1s, 2.5s and 4s)
const SHATTER_FRAME = 300;     // then the tube shatters, 5 seconds after Arkey arrives
const SHAKE_FRAMES = 18;       // the tube shakes for this long after each hit
const LUNGE_FRAMES = 18;       // Arkey swings in for this long after each hit
const LUNGE_DISTANCE = 30;     // how far Arkey swings towards the tube
const GRAVITY = 0.5;
const DOODLE_FALL_START_Y = FLOOR_Y - 170;  // Doodle starts his fall inside the tube
const DOODLE_OUTWARD_SPEED = -3;  // Doodle flies out to the left as the tube breaks...
const DOODLE_DIP = 30;            // ...and drops this far below the floor on his first landing, then bounces back up
const ARKEY_JUMP = -9;         // Arkey hops down off the tube and lands on the ground
const PAUSE_FRAMES = 45;       // a short pause after they land, before they walk off
const GET_UP_FRAME = 25;       // Doodle opens his eyes this many frames into the pause, as he gets up
// While they run out, Doodle's side picture runs for a random stretch, then his front view flashes
// for a moment, at random. He is surprised once, as he wakes up.
const WALK_SIDE_MIN = 90;      // side running lasts between 1.5 and 3 seconds...
const WALK_SIDE_MAX = 180;
const WALK_FRONT_MIN = 8;      // ...then the front view flashes for between an eighth and a quarter of a second
const WALK_FRONT_MAX = 14;
const SURPRISE_FRAMES = 30;    // the surprised face shows for half a second
const RUN_SPEED = 3.6;         // how fast they run out (faster than the walk into the lab)
const HOP_HEIGHT = 26;         // each running leap lifts them this many pixels off the ground...
const HOP_FRAMES = 30;         // ...and takes half a second, from one landing to the next
const ARKEY_HOP_DELAY = 15;    // Arkey leaps half a hop out of step with Doodle, so they don't move in lockstep
const APPROACH_HOP_HEIGHT = 10;  // Arkey's walk into the lab bounces gently...
const APPROACH_HOP_FRAMES = 40;  // ...one small bounce every two thirds of a second
const GET_UP_HEIGHT = 14;        // Doodle gives a little hop as he gets up...
const GET_UP_HOP_FRAMES = 20;    // ...which takes a third of a second
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
  testTube: "assets/test-tube.png",
  testTubeCracked1: "assets/test-tube-cracked-1.png",
  testTubeCracked2: "assets/test-tube-cracked-2.png",
  testTubeCracked3: "assets/test-tube-cracked-3.png",
  testTubeBroken: "assets/test-tube-broken.png",
  doodleEyesClosed: "assets/doodle-without-accessories-eyes-closed.png",
  arkeyFlashlight: "assets/arkey-moving-with-flashlight.png",
  doodleFalling: "assets/doodle-falling.png",
  doodleWithoutAccessories: "assets/doodle-without-accessories.png",
  doodleSurprised: "assets/doodle-without-accessories-surprised.png",
  doodleMovingWithoutAccessories: "assets/doodle-moving-without-accessories.png",
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

// ---------- Sound effects ----------
// The impact sound plays each time Arkey hits the tube. Each hit starts a fresh copy,
// so quick hits can overlap instead of cutting each other off.
// One sound for each hit (hit 1, hit 2, hit 3), so the three hits feel different.
// The second and third file names are placeholders until those sounds are added.
const TUBE_HIT_SOUNDS = [
  "sounds/test-tube-hit.mp3",
  "sounds/test-tube-hit-2.mp3",
  "sounds/test-tube-hit-3.mp3"
];

// Plays a sound effect file. Each play starts a fresh copy, so sounds can overlap.
// The volume follows the sound effects slider. A missing file just means no sound.
function playSound(file) {
  const sound = new Audio(file);
  sound.volume = soundVolume / 10;
  sound.play().catch(() => {});
}

// Plays the sound for hit number n (1, 2 or 3)
function playTubeHitSound(n) {
  playSound(TUBE_HIT_SOUNDS[n - 1]);
}

// The tube breaking, and Doodle splashing down on the floor (the water leaving the tank)
const SHATTER_SOUND = "sounds/shatter.mp3";
const SPLASH_SOUND = "sounds/splash.mp3";
const SOUND_LEAD_FRAMES = 18;   // the shatter and splash sounds start 0.3 seconds before the picture they match

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

// The test tube. hitCount is how many times Arkey has hit it (0 to 3).
let hitCount = 0;
let tubeShake = 0;       // frames left of shaking after a hit
let arkeyLunge = 0;      // frames left of Arkey's swing after a hit

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

// Draws a picture if it exists, or a plain coloured box in its place.
// stretch makes it taller (above 1) and narrower by the same amount, like a squash and stretch.
// The feet stay on bottomY, so it stretches up from the ground.
function drawActor(name, centerX, bottomY, height, flip, color, stretch = 1) {
  ctx.save();
  ctx.translate(centerX, bottomY);
  ctx.scale(1 / stretch, stretch);
  const drawn = drawSprite(name, 0, 0, height, flip);
  ctx.restore();
  if (!drawn) {
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
  return imageReady("doodleMovingWithoutAccessories") ? "doodleMovingWithoutAccessories" : "doodleWithoutAccessories";
}

// Whether Doodle is showing his side running picture or his front view, for the run out
let walkPicture = "side";
let walkNextSwitch = 0;     // the run frame at which the picture next changes

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// Called as the run out begins
function startWalkPictures() {
  walkPicture = "side";
  walkNextSwitch = randomBetween(WALK_SIDE_MIN, WALK_SIDE_MAX);
}

// A running leap. rise is how far the feet are off the ground. stretch makes the picture
// squashed as the feet touch down and stretched at the top of the leap (see drawActor).
function hopAt(frame, height = HOP_HEIGHT, frames = HOP_FRAMES) {
  const t = (frame % frames) / frames;
  const lift = Math.sin(t * Math.PI);
  return { rise: lift * height, stretch: 0.92 + 0.16 * lift };
}

// Squash on landing: the picture is wide and short just after it touches the ground, then springs back
function landingStretch(actor) {
  return 1 - 0.14 * actor.landSquash;
}

function updateWalkPictures() {
  if (phaseTime < walkNextSwitch) return;
  if (walkPicture === "side") {
    walkPicture = "front";
    walkNextSwitch = phaseTime + randomBetween(WALK_FRONT_MIN, WALK_FRONT_MAX);
  } else {
    walkPicture = "side";
    walkNextSwitch = phaseTime + randomBetween(WALK_SIDE_MIN, WALK_SIDE_MAX);
  }
}

function walkPictureName() {
  return walkPicture === "side" ? doodleWalkPicture() : "doodleWithoutAccessories";
}

// ---------- Falling and landing ----------
// Moves an actor under gravity, drifting sideways at vx while it is in the air.
// It bounces on its ground line. A first bounce from a dip (see DOODLE_DIP) moves the
// ground back up to the floor, so the actor sinks a little and then pops back up. After
// the second landing it stays put.
function fallToGround(actor) {
  if (actor.landed) return;
  actor.vy += GRAVITY;
  actor.y += actor.vy;
  actor.x += actor.vx;
  actor.vx *= 0.97;
  if (actor.vy > 0 && actor.y >= actor.ground) {
    actor.y = actor.ground;
    actor.landSquash = 1;
    actor.bounces++;
    if (actor.bounces > 1 || Math.abs(actor.vy) < 2) {
      actor.landed = true;
      actor.vy = 0;
      actor.vx = 0;
    } else {
      actor.vy = -actor.vy * 0.3;
      actor.ground = FLOOR_Y;
    }
  }
}

// Arkey hits the tube (n is 1, 2 or 3)
function hitTube(n) {
  hitCount = n;
  tubeShake = SHAKE_FRAMES;
  arkeyLunge = LUNGE_FRAMES;
  playTubeHitSound(n);
}

// ---------- Story start ----------
// Pressing Play (or Space / Enter) starts the story in the dark lab, with only the test tube showing
function startStory() {
  if (gameState !== "title") return;
  gameState = "story";
  setMenuVisible(false);
  arkey = { x: ARKEY_ENTER_X, y: FLOOR_Y, vy: 0, facingLeft: true, landed: true, bounces: 0, landSquash: 0 };
  doodle = null;
  hitCount = 0;
  tubeShake = 0;
  arkeyLunge = 0;
  setPhase("approach");
}

// The tube shatters: Doodle flies out to the left and falls, and Arkey hops down to the ground
function startDrop() {
  doodle = {
    x: TUBE_X, y: DOODLE_FALL_START_Y, vx: DOODLE_OUTWARD_SPEED, vy: 0,
    ground: FLOOR_Y + DOODLE_DIP, landed: false, bounces: 0, awake: false, surprisedUntil: 0, landSquash: 0,
    splashed: false
  };
  arkey.x = HIT_X;
  arkey.y = FLOOR_Y;
  arkey.vx = 0;
  arkey.vy = ARKEY_JUMP;
  arkey.ground = FLOOR_Y;
  arkey.landed = false;
  arkey.bounces = 0;
  arkey.landSquash = 0;
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
  if (tubeShake > 0) tubeShake--;
  if (arkeyLunge > 0) arkeyLunge--;
  // Landing squashes spring back to normal
  for (const actor of [arkey, doodle]) {
    if (actor && actor.landSquash > 0) actor.landSquash = Math.max(0, actor.landSquash - 0.08);
  }

  switch (phase) {
    case "approach":
      // Arkey walks in from off the right side, carrying his flashlight
      arkey.x -= WALK_SPEED;
      if (arkey.x <= HIT_X) {
        arkey.x = HIT_X;
        setPhase("hit");
      }
      break;

    case "hit":
      // Arkey swings three times. The third hit is followed by the shatter.
      HIT_FRAMES.forEach((frame, i) => {
        if (phaseTime === frame) hitTube(i + 1);
      });
      // The shatter sound starts just before the tube breaks
      if (phaseTime === SHATTER_FRAME - SOUND_LEAD_FRAMES) playSound(SHATTER_SOUND);
      if (phaseTime >= SHATTER_FRAME) startDrop();
      break;

    case "drop":
      fallToGround(doodle);
      fallToGround(arkey);
      // The splash starts SOUND_LEAD_FRAMES before Doodle lands. Work out where he will be that many
      // frames from now (gravity adds to his speed each frame), and play once he would be at the ground by then.
      const lead = SOUND_LEAD_FRAMES;
      const yLater = doodle.y + doodle.vy * lead + GRAVITY * lead * (lead + 1) / 2;
      if (!doodle.splashed && doodle.vy > 0 && yLater >= doodle.ground) {
        doodle.splashed = true;
        playSound(SPLASH_SOUND);
      }
      if (doodle.landed && arkey.landed) setPhase("pause");
      break;

    case "pause":
      // Doodle opens his eyes as he gets up off the ground, and is surprised for a moment
      if (phaseTime === GET_UP_FRAME) {
        doodle.awake = true;
        doodle.surprisedUntil = phaseTime + SURPRISE_FRAMES;
      }
      if (phaseTime >= PAUSE_FRAMES) {
        setPhase("walk");
        startWalkPictures();
      }
      break;

    case "walk":
      // They run out together, to the right, leaping as they go
      doodle.x += RUN_SPEED;
      arkey.x += RUN_SPEED;
      updateWalkPictures();
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

// The crack overlay for the current hit count. There is none before the first hit.
function crackOverlayPicture() {
  return hitCount === 0 ? null : "testTubeCracked" + hitCount;
}

// The tube while Arkey is hitting it. The tube shakes after each hit, and Doodle shakes with it.
// The layers, back to front: the tube, Doodle, then the cracks. The tube picture is solid,
// so Doodle is drawn on top of it, and the cracks sit in front of him.
function drawTubeScene() {
  const shakeX = tubeShake > 0 ? (Math.random() - 0.5) * 12 : 0;
  ctx.save();
  ctx.translate(shakeX, 0);
  drawActor("testTube", TUBE_X, FLOOR_Y, TUBE_H, false, "rgba(120, 190, 255, 0.25)");
  // Doodle floats gently inside the tube, like a fish in water: a small bob, drift and tilt
  const floatX = Math.sin(frameCount * 0.03) * 3;
  const floatY = Math.sin(frameCount * 0.05) * 4;
  const tilt = Math.sin(frameCount * 0.04) * 0.04;
  ctx.save();
  ctx.translate(TUBE_X + floatX, FLOOR_Y - 60 + floatY);
  ctx.rotate(tilt);
  drawActor("doodleEyesClosed", 0, 0, DOODLE_IN_TUBE_H, false, "#00a8e8");
  ctx.restore();

  // The crack overlay for this hit goes in front of Doodle
  const crack = crackOverlayPicture();
  if (crack) drawSprite(crack, TUBE_X, FLOOR_Y, TUBE_H, false);

  ctx.restore();
}

// The broken, empty test tube after Arkey smashes it
function drawBrokenTube() {
  drawSprite("testTubeBroken", TUBE_X, FLOOR_Y, TUBE_H, false);
}

// Doodle, falling out of the tube, then standing (or walking) without his accessories
function drawDoodle() {
  if (!doodle.landed) {
    drawActor("doodleFalling", doodle.x, doodle.y, DOODLE_H, false, "#00a8e8", landingStretch(doodle));
    return;
  }

  // Lying on the ground with his eyes closed until he gets up
  if (!doodle.awake) {
    drawActor("doodleEyesClosed", doodle.x, doodle.y, DOODLE_H, false, "#00a8e8", landingStretch(doodle));
    return;
  }

  // Running out: his side picture, with his front view flashing now and then, leaping as he goes
  if (phase === "walk") {
    const hop = hopAt(phaseTime);
    drawActor(walkPictureName(), doodle.x, doodle.y - hop.rise, DOODLE_H, false, "#00a8e8", hop.stretch);
    return;
  }

  // Getting up: a little hop, and surprised for a moment, then standing
  let hop = { rise: 0, stretch: landingStretch(doodle) };
  if (phase === "pause" && phaseTime >= GET_UP_FRAME && phaseTime < GET_UP_FRAME + GET_UP_HOP_FRAMES) {
    hop = hopAt(phaseTime - GET_UP_FRAME, GET_UP_HEIGHT, GET_UP_HOP_FRAMES);
  }
  const surprised = phase === "pause" && phaseTime < doodle.surprisedUntil;
  drawActor(surprised ? "doodleSurprised" : "doodleWithoutAccessories", doodle.x, doodle.y - hop.rise, DOODLE_H, false, "#00a8e8", hop.stretch);
}

// Arkey with his flashlight. He faces left when he walks in, then right when he leaves.
// After each hit he swings in towards the tube.
function drawArkey() {
  const swing = arkeyLunge > 0 ? Math.sin((1 - arkeyLunge / LUNGE_FRAMES) * Math.PI) * LUNGE_DISTANCE : 0;
  let hop = { rise: 0, stretch: landingStretch(arkey) };
  if (phase === "approach") hop = hopAt(phaseTime, APPROACH_HOP_HEIGHT, APPROACH_HOP_FRAMES);
  if (phase === "walk") hop = hopAt(phaseTime + ARKEY_HOP_DELAY);
  drawActor("arkeyFlashlight", arkey.x - swing, arkey.y - hop.rise, ARKEY_H, arkey.facingLeft, "#ffd400", hop.stretch);
}

// The lab scene (everything except the Times Square scene and the text)
function drawLabScene() {
  drawLab();
  applyBackgroundDarkness();
  drawTubeGlow();
  drawFlashlightGlow();

  if (phase === "approach" || phase === "hit") {
    drawTubeScene();
  } else {
    drawBrokenTube();
    drawDoodle();
  }
  drawArkey();

  drawVignette();
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
