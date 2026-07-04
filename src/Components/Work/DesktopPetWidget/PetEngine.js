// PetEngine.js — trimmed-down port of the desktop-pet engine for the web.
// Same sprite slicing / physics / AI-state-machine shape as the Tauri app's
// pet-canvas/PetEngine.js, minus everything that depended on the OS: no
// icon platforms/obstacles, no taskbar floor, no Rust mouse hook. The pet
// just walks a flat floor at the bottom of the viewport and reacts to real
// DOM mouse events.

const SHEET_COLS = 8;
const SHEET_ROWS = 6;

// ---------------------------------------------------------------------------
// Sprite alpha mask — tight per-frame box of visible pixels, so the hit
// area (click / drag / hover) hugs the drawn pixels instead of the mostly
// transparent 64x64 cell.
// ---------------------------------------------------------------------------
const ALPHA_MIN = 8;
const MASKS = new WeakMap();

function buildMask(img) {
  const fw = Math.floor(img.naturalWidth / SHEET_COLS);
  const fh = Math.floor(img.naturalHeight / SHEET_ROWS);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const frames = [];
  for (let row = 0; row < SHEET_ROWS; row++) {
    const cols = [];
    for (let col = 0; col < SHEET_COLS; col++) {
      let minX = fw, minY = fh, maxX = -1, maxY = -1;
      for (let y = 0; y < fh; y++) {
        for (let x = 0; x < fw; x++) {
          const a = data[((row * fh + y) * canvas.width + col * fw + x) * 4 + 3];
          if (a > ALPHA_MIN) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      cols.push(maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
    }
    frames.push(cols);
  }
  return { fw, fh, frames };
}

function getMask(img) {
  if (!img || !img.complete || !img.naturalWidth) return null;
  let mask = MASKS.get(img);
  if (!mask) {
    try {
      mask = buildMask(img);
    } catch {
      return null; // tainted canvas etc — fall back to the full box
    }
    MASKS.set(img, mask);
  }
  return mask;
}

// ---------------------------------------------------------------------------
// Animation map (sprite sheet rows) — same 8x6 layout as every generated
// desktop-pet sheet.
// ---------------------------------------------------------------------------
const ANIM = {
  idle: { row: 0, totalFrames: 8, startFrame: 0, loop: true, frameDelay: 9 },
  walk: { row: 1, totalFrames: 8, startFrame: 0, loop: true, frameDelay: 5 },
  sit: { row: 2, totalFrames: 8, startFrame: 0, loop: true, frameDelay: 11 },
  sleep: { row: 3, totalFrames: 8, startFrame: 0, loop: true, frameDelay: 16 },
  jump: { row: 4, totalFrames: 8, startFrame: 0, loop: false, frameDelay: 5 },
  look: { row: 5, totalFrames: 8, startFrame: 0, loop: true, frameDelay: 8 },
};

function animForState(state) {
  switch (state) {
    case 'WALKING_LEFT':
    case 'WALKING_RIGHT':
      return 'walk';
    case 'SLEEP':
      return 'sleep';
    case 'SIT':
      return 'sit';
    case 'JUMPING':
    case 'FALLING':
    case 'DRAGGING':
      return 'jump';
    case 'LOOKING':
      return 'look';
    case 'IDLE':
    default:
      return 'idle';
  }
}

const rand = (min, max) => min + Math.random() * (max - min);
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const HOVER_EMOTES = [':D', ':)', 'XD', '^_^', ':3', 'o_o', '!', '♪'];
const EMOTE_COOLDOWN_MS = 4000;
const EMOTE_DURATION_MS = 1600;

const ACTION_WEIGHTS = {
  WALKING_LEFT: 3,
  WALKING_RIGHT: 3,
  JUMPING: 1,
  IDLE: 2,
  SIT: 2,
  SLEEP: 1,
};
function weightedRandom(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [key, w] of Object.entries(weights)) {
    if ((roll -= w) <= 0) return key;
  }
  return Object.keys(weights)[0];
}

// ---------------------------------------------------------------------------
// DesktopPet — one sprite, its physics, its AI state, its bubble.
// ---------------------------------------------------------------------------
export class DesktopPet {
  constructor(x, y, spriteSheet, { width = 80, height = 80, speed = 1.5, floor } = {}) {
    this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;
    this.floor = floor ?? window.innerHeight - height;
    this.spriteSheet = spriteSheet;
    this.frameWidth = spriteSheet?.width ? spriteSheet.width / SHEET_COLS : 64;
    this.frameHeight = spriteSheet?.height ? spriteSheet.height / SHEET_ROWS : 64;

    this.vy = 0;
    this.gravity = 0.6;
    this.speed = speed;

    this.state = 'FALLING';
    this.facing = 1;

    this.currentFrame = 0;
    this.tick = 0;
    this.animKey = 'idle';

    this.nextDecisionAt = performance.now() + rand(800, 2000);
    this.lookUntil = 0;
    this.bubble = null; // { text, expires, emote? }
    this.nextEmoteAt = 0;
  }

  refreshFrameSize() {
    if (this.spriteSheet?.width) {
      this.frameWidth = this.spriteSheet.width / SHEET_COLS;
      this.frameHeight = this.spriteSheet.height / SHEET_ROWS;
    }
  }

  setFloor(floor) {
    this.floor = floor;
  }

  // ----- drag & drop -----
  startDrag(px, py) {
    this.state = 'DRAGGING';
    this.vy = 0;
    this.dragOffsetX = px - this.x;
    this.dragOffsetY = py - this.y;
  }

  dragTo(px, py) {
    this.x = Math.max(0, Math.min(px - this.dragOffsetX, window.innerWidth - this.w));
    this.y = Math.max(0, Math.min(py - this.dragOffsetY, this.floor));
  }

  drop(now) {
    this.y = this.floor;
    this.vy = 0;
    this.state = 'IDLE';
    this.nextDecisionAt = now + rand(1500, 4000);
  }

  // ----- interaction -----
  lookAt(cursorX) {
    this.state = 'LOOKING';
    this.vy = 0;
    this.facing = cursorX < this.x + this.w / 2 ? -1 : 1;
    this.lookUntil = performance.now() + 2500;
  }

  say(text) {
    this.bubble = { text, expires: performance.now() + 3500 };
  }

  emoteAtCursor(cursorX, now) {
    if (this.state === 'DRAGGING' || now < this.nextEmoteAt) return;
    this.nextEmoteAt = now + EMOTE_COOLDOWN_MS;
    if (!this.bubble || this.bubble.expires <= now || this.bubble.emote) {
      this.bubble = { text: pickRandom(HOVER_EMOTES), expires: now + EMOTE_DURATION_MS, emote: true };
    }
    if (this.state === 'IDLE' || this.state === 'SIT' || this.state === 'LOOKING') {
      this.facing = cursorX < this.x + this.w / 2 ? -1 : 1;
    }
  }

  frameCell() {
    const cfg = ANIM[animForState(this.state)];
    const col = Math.min(this.currentFrame, cfg.totalFrames - 1) + (cfg.startFrame || 0);
    return { row: cfg.row, col };
  }

  visibleRect() {
    const mask = getMask(this.spriteSheet);
    if (mask) {
      const { row, col } = this.frameCell();
      const fr = mask.frames[row]?.[col];
      if (fr) {
        const sx = this.w / mask.fw;
        const sy = this.h / mask.fh;
        const left = this.facing === -1 ? mask.fw - (fr.x + fr.w) : fr.x;
        return { x: this.x + left * sx, y: this.y + fr.y * sy, w: fr.w * sx, h: fr.h * sy };
      }
    }
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  hitTest(px, py) {
    const r = this.visibleRect();
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  // ----- AI brain -----
  decideNextAction(now) {
    if (this.state === 'DRAGGING') return;
    if (this.state === 'LOOKING' && now < this.lookUntil) return;
    if (this.state === 'FALLING' || this.state === 'JUMPING') return;
    if (now < this.nextDecisionAt) return;

    const next = weightedRandom(ACTION_WEIGHTS);
    this.state = next;
    if (next === 'JUMPING') this.vy = -12;
    if (next === 'WALKING_LEFT') this.facing = -1;
    if (next === 'WALKING_RIGHT') this.facing = 1;

    const dwell =
      next === 'SLEEP' ? rand(6000, 12000) : next === 'SIT' ? rand(3000, 7000) : rand(1200, 4000);
    this.nextDecisionAt = now + dwell;
  }

  // ----- per-frame update -----
  update(now) {
    this.decideNextAction(now);

    if (this.state === 'DRAGGING') {
      this.animate();
      return;
    }

    if (this.state === 'FALLING' || this.state === 'JUMPING') {
      this.vy += this.gravity;
      const nextY = this.y + this.vy;
      const driftX = this.x + this.facing * this.speed;
      this.x = Math.max(0, Math.min(driftX, window.innerWidth - this.w));

      if (this.vy > 0 && nextY >= this.floor) {
        this.y = this.floor;
        this.vy = 0;
        this.state = 'IDLE';
        this.nextDecisionAt = now + rand(400, 1500);
      } else {
        this.y = nextY;
      }
    } else if (this.state === 'WALKING_LEFT' || this.state === 'WALKING_RIGHT') {
      const dir = this.state === 'WALKING_LEFT' ? -1 : 1;
      this.facing = dir;
      let nextX = this.x + dir * this.speed;

      if (nextX < 0) {
        nextX = 0;
        this.state = 'WALKING_RIGHT';
      } else if (nextX + this.w > window.innerWidth) {
        nextX = window.innerWidth - this.w;
        this.state = 'WALKING_LEFT';
      }
      this.x = nextX;
    } else if (this.state === 'LOOKING') {
      if (now >= this.lookUntil) {
        this.state = 'IDLE';
        this.nextDecisionAt = now;
      }
    } else {
      // IDLE / SIT / SLEEP — stay glued to the floor (e.g. after a resize).
      this.y = this.floor;
    }

    this.animate();
  }

  animate() {
    const key = animForState(this.state);
    const cfg = ANIM[key];

    if (key !== this.animKey) {
      this.animKey = key;
      this.currentFrame = 0;
      this.tick = 0;
    }

    if (key === 'jump') {
      const vy = this.vy;
      this.currentFrame = vy < -8 ? 1 : vy < -4 ? 2 : vy < -1 ? 3 : vy < 1 ? 4 : vy < 5 ? 5 : 6;
      return;
    }

    this.tick++;
    if (this.tick >= cfg.frameDelay) {
      this.tick = 0;
      this.currentFrame++;
      if (this.currentFrame >= cfg.totalFrames) {
        this.currentFrame = cfg.loop ? 0 : cfg.totalFrames - 1;
      }
    }
  }

  draw(ctx) {
    if (!this.spriteSheet || !this.spriteSheet.complete || !this.spriteSheet.naturalWidth) return;
    const cfg = ANIM[animForState(this.state)];
    const startOffset = cfg.startFrame || 0;
    const frameIndex = Math.min(this.currentFrame, cfg.totalFrames - 1);
    const sx = (frameIndex + startOffset) * this.frameWidth;
    const sy = cfg.row * this.frameHeight;

    const dx = Math.round(this.x);
    const dy = Math.round(this.y);

    if (this.facing === -1) {
      ctx.save();
      ctx.translate(dx + this.w, dy);
      ctx.scale(-1, 1);
      ctx.drawImage(this.spriteSheet, sx, sy, this.frameWidth, this.frameHeight, 0, 0, this.w, this.h);
      ctx.restore();
    } else {
      ctx.drawImage(this.spriteSheet, sx, sy, this.frameWidth, this.frameHeight, dx, dy, this.w, this.h);
    }
  }
}

// ---------------------------------------------------------------------------
// PetEngine — owns the canvas, a single pet, and the rAF loop. Mouse events
// are forwarded straight from DOM listeners (CSS px already), unlike the
// Tauri app which had to convert from a physical-pixel OS mouse hook.
// ---------------------------------------------------------------------------
export class PetEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.pet = null;
    this.running = false;
    this.rafId = null;
    this.phrases = [];
    this.onFrame = null; // (pet, now) => void — for positioning the React bubble
    this.dragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragMoved = false;
  }

  setPhrases(phrases) {
    if (Array.isArray(phrases) && phrases.length) this.phrases = phrases;
  }

  spawn(spriteSheet, opts) {
    const x = rand(40, Math.max(60, window.innerWidth - 120));
    this.pet = new DesktopPet(x, -100, spriteSheet, opts);
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
    if (this.pet) {
      this.pet.setFloor(window.innerHeight - this.pet.h);
      this.pet.x = Math.min(this.pet.x, window.innerWidth - this.pet.w);
    }
  }

  getCursorForPoint(cx, cy) {
    if (this.dragging) return 'grabbing';
    return this.pet && this.pet.hitTest(cx, cy) ? 'pointer' : 'default';
  }

  handleMouseDown(cx, cy) {
    if (!this.pet || !this.pet.hitTest(cx, cy)) return false;
    this.dragging = true;
    this.dragStart = { x: cx, y: cy };
    this.dragMoved = false;
    this.pet.startDrag(cx, cy);
    return true;
  }

  handleMouseMove(cx, cy) {
    if (!this.pet) return;
    if (!this.dragging) {
      if (this.pet.hitTest(cx, cy)) this.pet.emoteAtCursor(cx, performance.now());
      return;
    }
    if (Math.abs(cx - this.dragStart.x) > 4 || Math.abs(cy - this.dragStart.y) > 4) {
      this.dragMoved = true;
    }
    if (this.dragMoved) this.pet.dragTo(cx, cy);
  }

  handleMouseUp(cx, cy) {
    if (!this.pet || !this.dragging) return;
    this.dragging = false;
    if (!this.dragMoved) {
      this.pet.lookAt(cx);
      if (this.phrases.length) this.pet.say(pickRandom(this.phrases));
      return;
    }
    this.pet.dragTo(cx, cy);
    this.pet.drop(performance.now());
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      const now = performance.now();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.pet) {
        this.pet.update(now);
        this.pet.draw(this.ctx);
      }
      if (this.onFrame) this.onFrame(this.pet, now);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
