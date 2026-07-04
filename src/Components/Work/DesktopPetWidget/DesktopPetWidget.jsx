import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PetEngine } from './PetEngine';
import './DesktopPetWidget.css';

const FALLBACK_PHRASES = [
  "Hi there! 👋",
  "Welcome to Zac's Portfolio",
  "I'm just vibing.",
  "Looking to hire a goated engineer? You've found one.",
  "Woof! Try dragging me around.",
  "Feel free to look around!",
];

// A pseudo, web-scoped version of the desktop-pet Tauri app: a sprite that
// walks the bottom of the viewport on this page, reacts to hover, and can be
// clicked (says a phrase) or dragged around. All physics/animation live in
// PetEngine.js; this component only wires up the canvas + real DOM mouse
// events and renders the speech-bubble / hover-emote as HTML overlays.
export default function DesktopPetWidget() {
  const canvasRef = useRef(null);
  const hitboxRef = useRef(null);
  const engineRef = useRef(null);
  const [bubble, setBubble] = useState(null);
  const [hitRect, setHitRect] = useState({ x: -999, y: -999, w: 0, h: 0 });
  const [cursor, setCursor] = useState('default');

  useEffect(() => {
    const engine = new PetEngine(canvasRef.current);
    engineRef.current = engine;
    engine.resize();

    // BASE_URL is the raw configured `base` ("/zac-portfolio" — no trailing
    // slash), so join with an explicit "/" or the path silently 404s.
    const asset = (p) => `${import.meta.env.BASE_URL}/${p}`.replace(/\/{2,}/g, '/');
    const sprite = new Image();
    sprite.src = asset('sprites/dog_cream.png');
    sprite.onload = () => engine.pet?.refreshFrameSize();
    engine.spawn(sprite, { width: 80, height: 80, speed: 1.5 });

    fetch(asset('pet-phrases.json'))
      .then((r) => r.json())
      .then((list) => engine.setPhrases(list))
      .catch(() => engine.setPhrases(FALLBACK_PHRASES));

    engine.onFrame = (pet, now) => {
      if (!pet) return;
      const r = pet.visibleRect();
      setHitRect({ x: r.x, y: r.y, w: r.w, h: r.h });
      setBubble(pet.bubble && pet.bubble.expires > now ? pet.bubble : null);
    };

    engine.start();

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    // Dragging can carry the cursor outside the small hitbox, so once a drag
    // starts we track move/up on the whole document instead.
    let isDown = false;
    const onDocMove = (e) => {
      if (!isDown) return;
      engine.handleMouseMove(e.clientX, e.clientY);
      setCursor(engine.getCursorForPoint(e.clientX, e.clientY));
    };
    const onDocUp = (e) => {
      if (!isDown) return;
      isDown = false;
      engine.handleMouseUp(e.clientX, e.clientY);
      setCursor(engine.getCursorForPoint(e.clientX, e.clientY));
      document.removeEventListener('mousemove', onDocMove);
      document.removeEventListener('mouseup', onDocUp);
    };
    const onHitboxDown = (e) => {
      if (!engine.handleMouseDown(e.clientX, e.clientY)) return;
      isDown = true;
      setCursor('grabbing');
      document.addEventListener('mousemove', onDocMove);
      document.addEventListener('mouseup', onDocUp);
    };
    const onHitboxMove = (e) => {
      if (isDown) return; // handled by onDocMove
      engine.handleMouseMove(e.clientX, e.clientY);
      setCursor(engine.getCursorForPoint(e.clientX, e.clientY));
    };
    const hitboxEl = hitboxRef.current;
    hitboxEl.addEventListener('mousedown', onHitboxDown);
    hitboxEl.addEventListener('mousemove', onHitboxMove);

    return () => {
      engine.stop();
      window.removeEventListener('resize', onResize);
      hitboxEl.removeEventListener('mousedown', onHitboxDown);
      hitboxEl.removeEventListener('mousemove', onHitboxMove);
      document.removeEventListener('mousemove', onDocMove);
      document.removeEventListener('mouseup', onDocUp);
    };
  }, []);

  // Portalled to <body> — ProjectDetail's motion.div applies an inline
  // `transform` for its enter/exit animation, and any transformed ancestor
  // becomes the containing block for `position: fixed` descendants. Left
  // inside it, the pet would be "fixed" to that (page-content-tall) div
  // instead of the viewport and end up scrolled miles offscreen.
  return createPortal(
    <div className="pet-widget-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="pet-widget-canvas" />
      <div
        ref={hitboxRef}
        className="pet-widget-hitbox"
        style={{
          left: hitRect.x,
          top: hitRect.y,
          width: hitRect.w,
          height: hitRect.h,
          cursor,
        }}
      />
      {bubble && (
        <div
          className={`pet-widget-bubble${bubble.emote ? ' pet-widget-bubble--emote' : ''}`}
          style={{
            left: Math.max(4, Math.min(hitRect.x, window.innerWidth - 190)),
            top: Math.max(4, hitRect.y - (bubble.emote ? 36 : 56)),
          }}
        >
          {bubble.text}
        </div>
      )}
    </div>,
    document.body,
  );
}
