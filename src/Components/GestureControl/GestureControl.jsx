/**
 * GestureControl.jsx
 *
 * JARVIS Hand Gesture Interface — Zachary Lee Portfolio
 * ─────────────────────────────────────────────────────
 * Lets visitors control the site with their hands via webcam.
 * Uses Google MediaPipe HandLandmarker — runs 100 % in-browser, no server.
 *
 * ── MODES ───────────────────────────────────────────────────────────────────
 *   'off'     Default. Only the arc-reactor toggle button is visible.
 *   'booting' Full-screen cinematic loading screen plays while the AI model
 *             downloads and the camera warms up.
 *   'on'      JARVIS HUD is live: glowing hand skeleton on canvas, targeting
 *             reticle tracks index fingertip, gestures drive the site.
 *
 * ── GESTURES ────────────────────────────────────────────────────────────────
 *   ☝️  Point (index up, others curled)      → moves the targeting cursor
 *   🤏  Pinch (thumb tip near index tip)     → clicks whatever is under cursor
 *   🖐️  Open hand + move up / down           → scrolls the page
 *   ✌️  Peace + horizontal swipe             → navigates prev / next page
 *
 * ── DEPENDENCIES ────────────────────────────────────────────────────────────
 *   @mediapipe/tasks-vision  hand landmark detection (npm install …)
 *   react-router-dom         useNavigate for page routing
 */

import { forwardRef, useImperativeHandle, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './GestureControl.css';

// ─── Hand Skeleton Connection Map ────────────────────────────────────────────
/**
 * MediaPipe gives 21 landmark points per hand, numbered 0–20:
 *   0        = wrist
 *   1–4      = thumb  (CMC → MCP → IP → tip)
 *   5–8      = index  (MCP → PIP → DIP → tip)
 *   9–12     = middle (MCP → PIP → DIP → tip)
 *   13–16    = ring   (MCP → PIP → DIP → tip)
 *   17–20    = pinky  (MCP → PIP → DIP → tip)
 *
 * Each pair below tells the canvas which two joints to connect with a line,
 * forming the visible glowing skeleton over the user's hand.
 */
const CONNECTIONS = [
  [0, 1],  [1, 2],  [2, 3],  [3, 4],   // thumb
  [0, 5],  [5, 6],  [6, 7],  [7, 8],   // index
  [0, 9],  [9, 10], [10, 11],[11, 12],  // middle
  [0, 13],[13, 14],[14, 15],[15, 16],   // ring
  [0, 17],[17, 18],[18, 19],[19, 20],   // pinky
  [5, 9], [9, 13],[13, 17],[0, 17],     // palm cross-braces (structural look)
];

// ─── Site Route Order ─────────────────────────────────────────────────────────
/**
 * Ordered list of this site's pages.
 * The peace-sign swipe gesture walks through this array to find the next
 * or previous page. Must match the routes in AnimatedRoutes.jsx.
 */
const PAGES = ['/', '/work', '/about', '/contact'];

// ─── Boot Sequence Script ─────────────────────────────────────────────────────
/**
 * Each entry appears on the loading screen at its `delay` (ms after boot starts).
 * The stagger creates a typewriter / system-boot cinematic effect.
 * Lines are personalized to Zachary Lee's portfolio identity.
 */
const BOOT_LINES = [
  { text: 'ZACHARY LEE — PORTFOLIO INTERFACE v2027',   delay: 0    },
  { text: '> INITIALIZING GESTURE CONTROL SYSTEM...',  delay: 500  },
  { text: '> LOADING HAND LANDMARK NEURAL NETWORK...', delay: 1000 },
  { text: '> REQUESTING CAMERA ACCESS...',             delay: 1700 },
  { text: '> CALIBRATING DEPTH SENSORS...',            delay: 2300 },
  { text: '> GESTURE CLASSIFIER: READY',               delay: 2900 },
  { text: '> DESIGN THINKING MODULE: ENGAGED',         delay: 3300 },
  { text: '> AI INTERFACE: ONLINE',                    delay: 3700 },
  { text: 'ALL SYSTEMS NOMINAL',                       delay: 4100 },
  { text: 'WELCOME. GESTURE CONTROL IS LIVE.',         delay: 4600 },
];

// ─── Gesture Detection ────────────────────────────────────────────────────────
/**
 * Reads 21 MediaPipe landmark objects and returns which gesture the hand shows.
 *
 * HOW "FINGER EXTENDED" WORKS
 *   MediaPipe normalized coords: y = 0 is the top of the frame, y = 1 is the
 *   bottom. When a finger points upward, its TIP has a SMALLER y value than
 *   the PIP (middle) joint. So: extended = (tip.y < pip.y)
 *
 * HOW "PINCH" WORKS
 *   Euclidean distance between thumb tip (index 4) and index tip (index 8)
 *   in normalized space. Values below 0.06 mean the fingertips are touching.
 *
 * @param {Array} lms  21 { x, y, z } landmark objects from MediaPipe
 * @returns {{ pinching, pointing, peace, open, fist }}
 */
function getGesture(lms) {
  const thumbTip = lms[4];
  const indexTip = lms[8];
  const midTip   = lms[12];
  const ringTip  = lms[16];
  const pinkyTip = lms[20];

  // PIP = Proximal InterPhalangeal joint (middle joint of each finger)
  const indexPIP = lms[6];
  const midPIP   = lms[10];
  const ringPIP  = lms[14];
  const pinkyPIP = lms[18];

  const iE = indexTip.y < indexPIP.y; // index extended?
  const mE = midTip.y   < midPIP.y;   // middle extended?
  const rE = ringTip.y  < ringPIP.y;  // ring extended?
  const pE = pinkyTip.y < pinkyPIP.y; // pinky extended?

  const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);

  return {
    pinching: pinchDist < 0.06,         // 🤏 thumb touches index tip
    pointing: iE && !mE && !rE,         // ☝️ only index finger up
    peace:    iE && mE && !rE && !pE,   // ✌️ index + middle up
    open:     iE && mE && rE && pE,     // 🖐️ all four fingers extended → SCROLL
    fist:     !iE && !mE && !rE && !pE, // ✊ all fingers curled (unused, reserved)
  };
}

// ─── Draw Glowing Hand Skeleton ───────────────────────────────────────────────
/**
 * Renders the holographic hand skeleton on a 2D canvas context.
 *
 * RENDERING APPROACH
 *   • Each bone (CONNECTION) is a gradient line (cyan → blue) with a canvas
 *     shadowBlur glow underneath.
 *   • Joint dots are filled circles. Fingertips (4, 8, 12, 16, 20) get a
 *     larger radius and a faint outer ring to look like sensors.
 *
 * WHY X IS MIRRORED:  toScreen uses `(1 - lm.x) * W`
 *   Front cameras return raw coords where your right hand appears on the LEFT
 *   side of the frame. Flipping X makes it feel like a mirror — intuitive.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}    lms       21 MediaPipe landmark objects
 * @param {Function} toScreen  converts a landmark to { x, y } pixel coords
 */
function drawSkeleton(ctx, lms, toScreen) {
  ctx.save();

  // ── Bones ───────────────────────────────────────────────────────────────
  CONNECTIONS.forEach(([a, b]) => {
    const p1   = toScreen(lms[a]);
    const p2   = toScreen(lms[b]);
    const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
    grad.addColorStop(0, 'rgba(0,229,255,0.95)');
    grad.addColorStop(1, 'rgba(0,120,255,0.95)');

    ctx.strokeStyle = grad;
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = 14;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // ── Joint dots ──────────────────────────────────────────────────────────
  const TIP_INDICES = new Set([4, 8, 12, 16, 20]);
  lms.forEach((lm, i) => {
    const p     = toScreen(lm);
    const isTip = TIP_INDICES.has(i);

    ctx.beginPath();
    ctx.arc(p.x, p.y, isTip ? 7 : 4, 0, Math.PI * 2);
    ctx.fillStyle   = isTip ? '#00e5ff' : '#0080ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur  = isTip ? 22 : 10;
    ctx.fill();

    // Faint outer ring on each fingertip — holographic sensor look
    if (isTip) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,229,255,0.22)';
      ctx.lineWidth   = 1;
      ctx.shadowBlur  = 0;
      ctx.stroke();
    }
  });

  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────
const GestureControl = forwardRef(function GestureControl({ onModeChange }, ref) {

  // ── UI state (triggers re-renders) ───────────────────────────────────────
  const [mode,       setMode]       = useState('off');          // 'off' | 'booting' | 'on'
  const [bootError,  setBootError]  = useState('');             // non-empty = show error on toggle
  const [bootLines,  setBootLines]  = useState([]);             // lines revealed on boot screen so far
  const [bootDone,   setBootDone]   = useState(false);          // true → fade out loading screen
  const [status,     setStatus]     = useState('');             // shown in HUD badge
  const [gesture,    setGesture]    = useState('');             // gesture label in HUD
  const [cursorPos,  setCursorPos]  = useState({ x: -300, y: -300 }); // index fingertip px position
  const [pinching,   setPinching]   = useState(false);          // turns reticle gold
  const [clickFlash, setClickFlash] = useState(null);           // { x, y, id } triggers burst anim
  const [showGuide,  setShowGuide]  = useState(false);          // gesture cheat-sheet

  const navigate = useNavigate();

  // ── Refs (do NOT trigger re-renders) ─────────────────────────────────────
  const videoRef      = useRef(null); // hidden <video> fed by webcam stream
  const canvasRef     = useRef(null); // full-screen overlay canvas
  const landmarkerRef = useRef(null); // MediaPipe HandLandmarker (loaded once, reused)
  const streamRef     = useRef(null); // webcam MediaStream (kept so we can stop tracks later)
  const rafRef        = useRef(null); // rAF handle (so we can cancel the loop)
  const runningRef    = useRef(false);// kill-switch: set to false to stop the loop

  /**
   * posHistRef — rolling buffer of the last 15 palm positions.
   *   Each entry: { x, y, t }  (x/y = screen px, t = Date.now() ms)
   *
   *   Used for:
   *     Scroll  — compare consecutive y values while open hand is held
   *     Swipe   — compare oldest vs newest x value over a short time window
   */
  const posHistRef    = useRef([]);
  const lastClickRef  = useRef(0); // timestamp — debounce click  (900 ms gap)
  const lastScrollRef = useRef(0); // timestamp — debounce scroll (one frame ≈ 16 ms)
  const lastNavRef    = useRef(0); // timestamp — debounce navigate (1500 ms gap)
  const fistStartRef  = useRef(0); // when fist gesture began — hold 1.5 s to exit
  const deactivateRef = useRef(null); // stable ref so the rAF loop can call deactivate

  // ── stopAll ───────────────────────────────────────────────────────────────
  /**
   * Kills the detection loop and releases the webcam.
   * Called on deactivate AND on component unmount (cleanup).
   */
  const stopAll = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  // ── runDetection ──────────────────────────────────────────────────────────
  /**
   * Core detection loop — called on every animation frame while JARVIS is on.
   *
   * Each frame:
   *   1. Clears + resizes the canvas to match the current viewport.
   *   2. Sends the current video frame to MediaPipe for hand detection.
   *   3. If a hand is found:
   *        a. Draws the glowing skeleton via drawSkeleton().
   *        b. Determines gesture via getGesture().
   *        c. Moves the cursor reticle to the index fingertip.
   *        d. Pushes palm position to posHistRef for scroll / swipe math.
   *        e. Fires the matching action (click / scroll / navigate).
   *   4. Schedules itself for the next frame with requestAnimationFrame.
   *
   * Arguments are passed explicitly (rather than reading refs) to avoid
   * stale-closure bugs — the exact objects alive at activation are used.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLVideoElement}  video
   * @param {HandLandmarker}    landmarker
   * @param {Function}          nav   — navigate() from useNavigate
   */
  const runDetection = useCallback((canvas, video, landmarker, nav) => {
    if (!runningRef.current) return; // externally killed — stop recursing

    const ctx = canvas.getContext('2d');

    // Resize canvas every frame so it always covers the full viewport
    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    ctx.clearRect(0, 0, W, H);

    /**
     * toScreen(lm) — converts a normalized MediaPipe landmark (0–1) to pixels.
     *
     * X is MIRRORED: `(1 - lm.x) * W`
     *   Raw camera has your right hand on the LEFT side of the frame.
     *   Flipping X makes "move right hand right" → "cursor moves right".
     */
    const toScreen = lm => ({ x: (1 - lm.x) * W, y: lm.y * H });

    // performance.now() gives the precise timestamp MediaPipe needs in VIDEO mode
    const results = landmarker.detectForVideo(video, performance.now());

    if (results.landmarks?.length > 0) {
      const lms     = results.landmarks[0]; // first (only) detected hand
      const g       = getGesture(lms);
      const indexPt = toScreen(lms[8]);     // index fingertip → drives reticle
      const palm    = toScreen(lms[0]);     // wrist used as a palm-center proxy
      const now     = Date.now();

      drawSkeleton(ctx, lms, toScreen);

      setCursorPos(indexPt);
      setPinching(g.pinching);

      // ── ACTION: Fist held for 1.5 s → exit JARVIS ────────────────────────
      // Track when the fist started. If held continuously for 1500 ms, deactivate.
      if (g.fist) {
        if (fistStartRef.current === 0) fistStartRef.current = now;
        if (now - fistStartRef.current >= 1500) {
          deactivateRef.current?.();
          return; // stop the loop — deactivate handles cleanup
        }
      } else {
        fistStartRef.current = 0; // reset if fist breaks before threshold
      }

      const fistProgress = (g.fist && fistStartRef.current)
        ? Math.min(1, (now - fistStartRef.current) / 1500)
        : 0;

      // ── DRAW: Fist exit progress ring ─────────────────────────────────────
      // When a fist is detected, draw a circular arc around the hand that fills
      // clockwise as the hold progresses. The ring centre is the average of the
      // four MCP knuckle joints (a stable palm-centre estimate).
      // Radius is the max distance from that centre to any fingertip, + padding.
      if (fistProgress > 0) {
        // Palm centre = average of knuckle landmarks 5, 9, 13, 17
        const knuckles = [5, 9, 13, 17].map(i => toScreen(lms[i]));
        const cx = knuckles.reduce((s, p) => s + p.x, 0) / 4;
        const cy = knuckles.reduce((s, p) => s + p.y, 0) / 4;

        // Radius = farthest tip from centre + 24 px breathing room
        const tipPts = [4, 8, 12, 16, 20].map(i => toScreen(lms[i]));
        const radius = Math.max(...tipPts.map(p => Math.hypot(p.x - cx, p.y - cy))) + 24;

        // Dim full-circle track
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,229,255,0.15)';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Bright progress arc — starts at top (-π/2), sweeps clockwise
        const endAngle = -Math.PI / 2 + Math.PI * 2 * fistProgress;
        // Interpolate colour from cyan → gold as progress nears 100 %
        const r = Math.round(fistProgress * 255);
        const g2 = Math.round(200 + fistProgress * 55);
        const b = Math.round(255 * (1 - fistProgress));
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, endAngle);
        ctx.strokeStyle = `rgb(${r},${g2},${b})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.shadowColor = `rgb(${r},${g2},${b})`;
        ctx.shadowBlur = 20;
        ctx.stroke();

        // Small dot at the leading edge of the arc for a cleaner look
        const dotX = cx + radius * Math.cos(endAngle);
        const dotY = cy + radius * Math.sin(endAngle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r},${g2},${b})`;
        ctx.shadowBlur = 24;
        ctx.fill();

        ctx.restore();
      }

      const fistHoldPct = Math.round(fistProgress * 100);

      let label = '';
      if      (g.fist && fistHoldPct > 0) label = `⬡  EXIT JARVIS ${fistHoldPct}%`;
      else if (g.pinching)                label = '⬡  PINCH SELECT';
      else if (g.pointing)                label = '⬡  TARGETING';
      else if (g.open)                    label = '⬡  SCROLL MODE';
      else if (g.peace)                   label = '⬡  NAVIGATE';
      setGesture(label);

      // Append palm position to rolling history for swipe / scroll math
      posHistRef.current.push({ ...palm, t: now });
      if (posHistRef.current.length > 15) posHistRef.current.shift();

      // ── ACTION: Pinch → Click ──────────────────────────────────────────
      /**
       * elementFromPoint returns the topmost visible DOM element at the
       * cursor's pixel position. Calling .click() on it fires the same
       * synthetic event as a real mouse click, so React onClick handlers fire.
       * Debounced to 900 ms — prevents a held pinch from spamming clicks.
       */
      if (g.pinching && now - lastClickRef.current > 900) {
        lastClickRef.current = now;
        const el = document.elementFromPoint(indexPt.x, indexPt.y);
        if (el) {
          el.click();
          setClickFlash({ x: indexPt.x, y: indexPt.y, id: now });
        }
      }

      // ── ACTION: Open hand + vertical movement → Scroll ────────────────
      /**
       * Compare y of the current frame's palm against the previous frame's.
       * Positive dy = hand moved DOWN the screen → scroll page DOWN (natural).
       * Multiplied by 5 to amplify the small per-frame delta into a useful
       * scroll distance. Debounced to one frame gap (~16 ms).
       */
      if (g.open && posHistRef.current.length >= 2) {
        const prev = posHistRef.current[posHistRef.current.length - 2];
        const curr = posHistRef.current[posHistRef.current.length - 1];
        const dy   = curr.y - prev.y;
        // Negated so hand-up = scroll down, matching Windows scroll wheel direction
        if (Math.abs(dy) > 2 && now - lastScrollRef.current > 16) {
          window.scrollBy(0, -dy * 5);
          lastScrollRef.current = now;
        }
      }

      // ── ACTION: Peace sign + horizontal swipe → Navigate ──────────────
      /**
       * Compares the oldest entry in the position buffer against the newest.
       * If horizontal displacement > 20 % of screen width AND that movement
       * happened within 800 ms, it's a valid swipe.
       *
       * Swipe LEFT  (dx < 0, hand travels left on screen)  → NEXT page
       * Swipe RIGHT (dx > 0, hand travels right on screen) → PREVIOUS page
       *
       * window.location.hash is used because App.jsx uses HashRouter:
       *   e.g. hash = "#/work" → strip "#" → currentPath = "/work"
       */
      if (g.peace && posHistRef.current.length >= 8 && now - lastNavRef.current > 1500) {
        const oldest = posHistRef.current[0];
        const latest = posHistRef.current[posHistRef.current.length - 1];
        const dx     = latest.x - oldest.x;
        const dt     = latest.t - oldest.t;

        if (Math.abs(dx) > W * 0.2 && dt < 800) {
          const currentPath = window.location.hash.replace('#', '') || '/';
          const idx  = PAGES.indexOf(currentPath);
          const next = dx < 0
            ? Math.min(idx + 1, PAGES.length - 1)  // left swipe = forward
            : Math.max(idx - 1, 0);                 // right swipe = back

          if (next !== idx) {
            nav(PAGES[next]);
            lastNavRef.current = now;
            posHistRef.current = []; // clear so the swipe can't re-fire
          }
        }
      }

    } else {
      // No hand in frame — park cursor off-screen and show scanning status
      setCursorPos({ x: -300, y: -300 });
      setGesture('SCANNING...');
      setPinching(false);
    }

    rafRef.current = requestAnimationFrame(() =>
      runDetection(canvas, video, landmarker, nav)
    );
  }, []); // stable — all values come via arguments or stable refs

  // ── activate ──────────────────────────────────────────────────────────────
  /**
   * Triggered when user clicks the arc-reactor button from 'off' state.
   *
   * SEQUENCE
   *   1. Switch to 'booting' — renders the full-screen loading screen.
   *   2. Stagger each BOOT_LINE into state so they reveal one at a time.
   *   3. In parallel, download the MediaPipe WASM runtime + hand model (~5 MB).
   *   4. Request webcam permission (browser native prompt appears here).
   *   5. Enforce a minimum display time (MIN_BOOT_MS) for the cinematic effect —
   *      even on a fast connection the boot screen plays out fully.
   *   6. Set bootDone = true → CSS fades the loading screen out.
   *   7. After a short pause, switch to 'on' and start the detection loop.
   *
   * The HandLandmarker is only created once (landmarkerRef.current check) so
   * toggling on/off reuses the already-loaded model on subsequent activations.
   *
   * If camera is denied or the model fails to load, we silently fall back to
   * 'off' so the rest of the site remains completely unaffected.
   */
  const activate = useCallback(async () => {
    // JARVIS is desktop-only — webcam gesture control doesn't suit mobile
    if (window.innerWidth <= 768) return;

    const MIN_BOOT_MS = 5000;

    setMode('booting');
    setBootError('');
    setBootLines([]);
    setBootDone(false);

    // Stagger boot lines — each appears at its own delay
    BOOT_LINES.forEach(({ text, delay }) => {
      setTimeout(() => setBootLines(prev => [...prev, text]), delay);
    });

    try {
      // ── MediaPipe init ─────────────────────────────────────────────────
      // WASM runtime and model are served locally from public/mediapipe/
      // so there is zero CDN dependency. import.meta.env.BASE_URL resolves
      // to '/' in dev and '/zac-portfolio/' in the production GitHub Pages build.
      // Normalise BASE_URL to always end with '/' so path joins are safe.
      // Vite doesn't guarantee a trailing slash when base lacks one in config.
      const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

      const vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);

      if (!landmarkerRef.current) {
        // v0.10+ renamed .create() to .createFromOptions()
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `${base}mediapipe/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
      }

      // ── Camera init ────────────────────────────────────────────────────
      // getUserMedia triggers the browser's camera permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current          = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // ── Enforce minimum boot duration ──────────────────────────────────
      // Ensures the cinematic boot sequence plays fully even on fast networks
      await new Promise(r => setTimeout(r, MIN_BOOT_MS));

      // Trigger CSS fade-out of the loading screen
      setBootDone(true);
      setStatus('ONLINE');

      // Brief pause so "WELCOME. GESTURE CONTROL IS LIVE." is visible before exit
      await new Promise(r => setTimeout(r, 900));

      setMode('on');

      // Show gesture guide for 6 s then auto-dismiss
      setShowGuide(true);
      setTimeout(() => setShowGuide(false), 6000);

      // Start the detection loop
      runningRef.current = true;
      fistStartRef.current = 0;
      runDetection(canvasRef.current, videoRef.current, landmarkerRef.current, navigate);

    } catch (err) {
      console.error('[GestureControl] Activation failed:', err);
      stopAll();
      setMode('off');
      setBootLines([]);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera access denied'
        : 'Failed to load — try again';
      setBootError(msg);
      setTimeout(() => setBootError(''), 4000); // auto-clear after 4 s
    }
  }, [navigate, runDetection, stopAll]);

  // ── deactivate ────────────────────────────────────────────────────────────
  /**
   * Stops the detection loop, releases the webcam, and resets all UI state
   * back to 'off'. Also clears the canvas so no skeleton lingers on screen.
   */
  const deactivate = useCallback(() => {
    stopAll();
    setMode('off');
    setGesture('');
    setPinching(false);
    setBootLines([]);
    setBootDone(false);
    setShowGuide(false);
    setCursorPos({ x: -300, y: -300 });

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [stopAll]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  // Keep deactivateRef pointed at the latest deactivate so the rAF loop can call it
  useEffect(() => { deactivateRef.current = deactivate; }, [deactivate]);

  useEffect(() => () => stopAll(), [stopAll]);

  // Expose activate / deactivate to the parent AIMenu via forwarded ref
  useImperativeHandle(ref, () => ({ activate, deactivate }), [activate, deactivate]);

  // Notify parent of mode changes so AIMenu can reflect active state
  useEffect(() => { onModeChange?.(mode); }, [mode, onModeChange]);

  const isOn      = mode === 'on';
  const isBooting = mode === 'booting';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hidden webcam feed ──────────────────────────────────────────────
          Never shown — acts as the live frame source for MediaPipe.
          muted + playsInline are required for autoplay to work in browsers. */}
      <video ref={videoRef} style={{ display: 'none' }} muted playsInline />

      {/* ── Hand skeleton canvas ────────────────────────────────────────────
          Full-screen, pointer-events: none so it never blocks site interactions.
          drawSkeleton() writes to this every animation frame. */}
      <canvas
        ref={canvasRef}
        className={`jarvis-canvas${isOn ? ' jarvis-canvas--visible' : ''}`}
      />

      {/* ── Boot / loading screen ───────────────────────────────────────────
          Covers the full viewport while mode === 'booting'.
          Adding jarvis-boot--done triggers the CSS fade+slide exit animation. */}
      {isBooting && (
        <div className={`jarvis-boot${bootDone ? ' jarvis-boot--done' : ''}`}>

          {/* Subtle hexagonal grid texture in the background */}
          <div className="jarvis-boot__hex-grid" />

          {/* Single bright line that sweeps down the screen like a scanner */}
          <div className="jarvis-boot__scanline" />

          {/* Central arc-reactor graphic — three concentric spinning rings + core */}
          <div className="jarvis-boot__center">
            <div className="jarvis-boot__reactor">
              <div className="jarvis-boot__reactor-ring jarvis-boot__reactor-ring--1" />
              <div className="jarvis-boot__reactor-ring jarvis-boot__reactor-ring--2" />
              <div className="jarvis-boot__reactor-ring jarvis-boot__reactor-ring--3" />
              <div className="jarvis-boot__reactor-core" />
            </div>
          </div>

          {/* Sequenced boot log — one line appears per BOOT_LINES entry */}
          <div className="jarvis-boot__log">
            {bootLines.map((line, i) => (
              <div
                key={i}
                className={`jarvis-boot__log-line${
                  i === bootLines.length - 1 ? ' jarvis-boot__log-line--active' : ''
                }`}
              >
                {line}
              </div>
            ))}
            {/* Blinking underscore cursor — hidden once bootDone is true */}
            {bootLines.length > 0 && !bootDone && (
              <span className="jarvis-boot__cursor">_</span>
            )}
          </div>

          {/* ── Gesture instructions ──────────────────────────────────────
              Shown on the right side of the boot screen so users know
              exactly what to do before JARVIS goes live. Each card fades
              in after a short stagger delay (set via CSS animation-delay)
              so they appear progressively rather than all at once. */}
          <div className="jarvis-boot__instructions">
            <div className="jarvis-boot__instructions-title">
              // GESTURE REFERENCE
            </div>

            <div className="jarvis-boot__instruction-card" style={{ animationDelay: '1.2s' }}>
              <div className="jarvis-boot__instruction-icon">☝️</div>
              <div className="jarvis-boot__instruction-text">
                <div className="jarvis-boot__instruction-name">POINT</div>
                <div className="jarvis-boot__instruction-desc">
                  Raise your index finger — the targeting reticle follows your fingertip
                </div>
              </div>
            </div>

            <div className="jarvis-boot__instruction-card" style={{ animationDelay: '1.6s' }}>
              <div className="jarvis-boot__instruction-icon">🤏</div>
              <div className="jarvis-boot__instruction-text">
                <div className="jarvis-boot__instruction-name">PINCH</div>
                <div className="jarvis-boot__instruction-desc">
                  Bring thumb and index together to click whatever the cursor is over
                </div>
              </div>
            </div>

            <div className="jarvis-boot__instruction-card" style={{ animationDelay: '2.0s' }}>
              <div className="jarvis-boot__instruction-icon">🖐️</div>
              <div className="jarvis-boot__instruction-text">
                <div className="jarvis-boot__instruction-name">OPEN HAND WAVE</div>
                <div className="jarvis-boot__instruction-desc">
                  Spread all fingers open and move your hand up or down to scroll
                </div>
              </div>
            </div>

            <div className="jarvis-boot__instruction-card" style={{ animationDelay: '2.4s' }}>
              <div className="jarvis-boot__instruction-icon">✌️</div>
              <div className="jarvis-boot__instruction-text">
                <div className="jarvis-boot__instruction-name">PEACE + SWIPE</div>
                <div className="jarvis-boot__instruction-desc">
                  Hold a peace sign and swipe left or right to navigate between pages
                </div>
              </div>
            </div>

            <div className="jarvis-boot__instruction-card" style={{ animationDelay: '2.8s' }}>
              <div className="jarvis-boot__instruction-icon">✊</div>
              <div className="jarvis-boot__instruction-text">
                <div className="jarvis-boot__instruction-name">HOLD FIST — EXIT</div>
                <div className="jarvis-boot__instruction-desc">
                  Close all fingers into a fist and hold for 1.5 s to exit JARVIS
                </div>
              </div>
            </div>

            <div className="jarvis-boot__instructions-tip" style={{ animationDelay: '3.2s' }}>
              // Ensure your hand is visible to the camera and well-lit
            </div>
          </div>

          {/* HUD corner brackets — same style as the active HUD */}
          <div className="jarvis-boot__corners">
            <div className="jarvis-boot__corner jarvis-boot__corner--tl" />
            <div className="jarvis-boot__corner jarvis-boot__corner--tr" />
            <div className="jarvis-boot__corner jarvis-boot__corner--bl" />
            <div className="jarvis-boot__corner jarvis-boot__corner--br" />
          </div>
        </div>
      )}

      {/* ── Active JARVIS HUD ───────────────────────────────────────────────
          Rendered only while mode === 'on'. */}
      {isOn && (
        <>
          {/* CRT-style horizontal scanlines layered over the full viewport */}
          <div className="jarvis-scanlines" aria-hidden="true" />

          {/* Four corner HUD brackets */}
          <div className="hud-corner hud-corner--tl" aria-hidden="true" />
          <div className="hud-corner hud-corner--tr" aria-hidden="true" />
          <div className="hud-corner hud-corner--bl" aria-hidden="true" />
          <div className="hud-corner hud-corner--br" aria-hidden="true" />

          {/* Status bar — top-center, shows tracking state + current gesture */}
          <div className="jarvis-status" aria-live="polite">
            <div className="jarvis-status__row">
              HAND TRACKING
              <span className="jarvis-status__badge jarvis-status__badge--online">
                {status}
              </span>
            </div>
            {gesture && (
              <div className="jarvis-status__gesture">{gesture}</div>
            )}
          </div>

          {/* Gesture guide — appears for 6 s after activation then fades */}
          {showGuide && (
            <div className="jarvis-guide" role="tooltip">
              <div className="jarvis-guide__title">GESTURE CONTROLS</div>
              <div className="jarvis-guide__item">☝️  Point → Move cursor</div>
              <div className="jarvis-guide__item">🤏  Pinch → Select / Click</div>
              <div className="jarvis-guide__item">🖐️  Open hand + move → Scroll</div>
              <div className="jarvis-guide__item">✌️  Peace + swipe → Navigate pages</div>
              <div className="jarvis-guide__item">✊  Hold fist 1.5s → Exit JARVIS</div>
            </div>
          )}
        </>
      )}

      {/* ── Targeting reticle cursor ────────────────────────────────────────
          Positioned at the index fingertip every frame via cursorPos state.
          translate(-50%,-50%) in CSS centers the element on that coordinate.
          Switches to gold when pinching via the --pinching modifier class. */}
      <div
        className={[
          'jarvis-cursor',
          isOn     ? 'jarvis-cursor--visible'  : '',
          pinching ? 'jarvis-cursor--pinching' : '',
        ].join(' ')}
        style={{ left: cursorPos.x, top: cursorPos.y }}
        aria-hidden="true"
      />

      {/* ── Click burst ─────────────────────────────────────────────────────
          A new element is mounted each time clickFlash is set (unique key).
          The CSS @keyframes animation plays once; onAnimationEnd removes it. */}
      {clickFlash && (
        <div
          key={clickFlash.id}
          className="jarvis-click-burst"
          style={{ left: clickFlash.x, top: clickFlash.y }}
          onAnimationEnd={() => setClickFlash(null)}
          aria-hidden="true"
        />
      )}

    </>
  );
});

export default GestureControl;
