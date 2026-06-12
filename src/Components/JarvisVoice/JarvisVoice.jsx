/**
 * JarvisVoice.jsx
 *
 * JARVIS Voice Interface (Mobile) — Zachary Lee Portfolio
 * ───────────────────────────────────────────────────────
 * Mobile counterpart of GestureControl. Instead of webcam gestures it offers
 * a walkie-talkie style voice chat with the same AI brain (ChatContext):
 *
 *   1. Hold the talk button → Web Speech API SpeechRecognition transcribes.
 *   2. Release → final transcript is sent through ChatContext.sendMessage().
 *   3. The assistant reply streams into the shared transcript, then is read
 *      aloud with speechSynthesis.
 *
 * Mirrors GestureControl's contract exactly:
 *   - forwardRef exposing activate() / deactivate()
 *   - reports mode ('off' | 'booting' | 'on') via onModeChange
 *
 * INPUT CHANNELS
 *   - On-screen push-to-talk button (primary, reliable everywhere)
 *   - Hardware volume keys (progressive enhancement only — iOS Safari never
 *     delivers volume key events to JS and Android Chrome is inconsistent,
 *     so this can't be relied upon; the on-screen button is the real control)
 *
 * FALLBACKS
 *   - No SpeechRecognition support → talk button disabled + message pointing
 *     the visitor to the regular zac.ai chat.
 *   - Mic permission denied / no speech detected → inline HUD error message.
 *   - iOS speechSynthesis is unlocked by speaking a silent utterance during
 *     the user's activation tap (audio APIs need a user gesture on iOS).
 */

import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  useCallback,
  useContext,
} from 'react';
import { ChatContext } from '../Chat/ChatContext';
import './JarvisVoice.css';

// SpeechRecognition is still vendor-prefixed in Chrome/Safari
const SpeechRecognitionImpl =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : undefined;

// ─── Boot Sequence Script ────────────────────────────────────────────────────
// Shorter than the desktop boot — no 5 MB model download to mask, just flavor.
const BOOT_LINES = [
  { text: 'ZACHARY LEE — PORTFOLIO INTERFACE v2027', delay: 0    },
  { text: '> INITIALIZING VOICE UPLINK...',          delay: 350  },
  { text: '> AUDIO CODEC: READY',                    delay: 800  },
  { text: '> SPEECH RECOGNITION: ARMED',             delay: 1200 },
  { text: '> AI INTERFACE: ONLINE',                  delay: 1600 },
  { text: 'WELCOME. VOICE CONTROL IS LIVE.',         delay: 2000 },
];
const MIN_BOOT_MS = 2400;

// ─── Markdown stripper for TTS ───────────────────────────────────────────────
// speechSynthesis would otherwise read "asterisk asterisk" etc. literally.
function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' code block omitted ') // fenced code
    .replace(/`([^`]+)`/g, '$1')                        // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')           // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')            // links
    .replace(/^#{1,6}\s+/gm, '')                        // headings
    .replace(/(\*\*|__)(.*?)\1/g, '$2')                 // bold
    .replace(/(\*|_)(.*?)\1/g, '$2')                    // italics
    .replace(/^\s*[-*+]\s+/gm, '')                      // bullets
    .replace(/^\s*\d+\.\s+/gm, '')                      // numbered lists
    .replace(/^>\s+/gm, '')                             // blockquotes
    .replace(/\s+/g, ' ')
    .trim();
}

// Prefer an English voice so replies don't get read with a non-English accent
function pickEnglishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  return (
    voices.find(v => /^en[-_]/i.test(v.lang) && v.localService) ||
    voices.find(v => /^en[-_]/i.test(v.lang)) ||
    null
  );
}

const isVolumeKey = (e) =>
  e.key === 'AudioVolumeUp' ||
  e.key === 'AudioVolumeDown' ||
  e.keyCode === 175 ||
  e.keyCode === 174;

const JarvisVoice = forwardRef(function JarvisVoice({ onModeChange }, ref) {
  const { messages, sendMessage, isLoading } = useContext(ChatContext);

  // ── Mode state (mirrors GestureControl) ──────────────────────────────────
  const [mode, setMode] = useState('off'); // 'off' | 'booting' | 'on'
  const [bootLines, setBootLines] = useState([]);
  const [bootDone, setBootDone] = useState(false);

  // ── Voice state ───────────────────────────────────────────────────────────
  // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [voiceState, setVoiceState] = useState('idle');
  const [interim, setInterim] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const supported = Boolean(SpeechRecognitionImpl);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const modeRef       = useRef('off');
  const recRef        = useRef(null);   // active SpeechRecognition instance
  const listeningRef  = useRef(false);  // true between start() and onend
  const finalRef      = useRef('');     // accumulated final transcript
  const busyRef       = useRef(false);  // sending / speaking in progress
  const timersRef     = useRef([]);     // boot timers, for cleanup
  const messagesRef   = useRef(messages);
  const transcriptRef = useRef(null);   // scroll container
  const volKeyHeldRef = useRef(false);  // volume-key currently held

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { modeRef.current = mode; onModeChange?.(mode); }, [mode, onModeChange]);

  // Auto-scroll transcript to the latest message / streamed chunk
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, interim, voiceState]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // ── Speech output ─────────────────────────────────────────────────────────
  const speak = useCallback((text) => {
    const synth = window.speechSynthesis;
    if (!synth || !text) {
      setVoiceState('idle');
      busyRef.current = false;
      return;
    }
    synth.cancel(); // drop anything queued
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickEnglishVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang || 'en-US';
    utter.rate = 1.02;
    utter.pitch = 1;
    const done = () => {
      busyRef.current = false;
      if (modeRef.current === 'on') setVoiceState('idle');
    };
    utter.onend = done;
    utter.onerror = done;
    setVoiceState('speaking');
    synth.speak(utter);
  }, []);

  // ── Send transcript → AI → speak reply ────────────────────────────────────
  const handleSend = useCallback(async (text) => {
    busyRef.current = true;
    setVoiceState('thinking');
    setErrorMsg('');
    try {
      await sendMessage(text); // resolves only after streaming completes
      // Let React flush the final assistant chunk into messagesRef
      await new Promise(r => setTimeout(r, 80));
      if (modeRef.current !== 'on') { busyRef.current = false; return; }
      const reply = [...messagesRef.current].reverse().find(m => m.role === 'assistant');
      if (reply?.content) {
        speak(stripMarkdown(reply.content));
      } else {
        busyRef.current = false;
        setVoiceState('idle');
      }
    } catch {
      busyRef.current = false;
      if (modeRef.current === 'on') {
        setVoiceState('idle');
        setErrorMsg('TRANSMISSION FAILED — TRY AGAIN');
      }
    }
  }, [sendMessage, speak]);

  // ── Push-to-talk: start listening ─────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!supported || listeningRef.current || busyRef.current) return;
    if (modeRef.current !== 'on') return;

    window.speechSynthesis?.cancel(); // barge-in: stop any reply mid-sentence

    const rec = new SpeechRecognitionImpl();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    finalRef.current = '';

    rec.onresult = (ev) => {
      let interimText = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        if (result.isFinal) finalRef.current += result[0].transcript + ' ';
        else interimText += result[0].transcript;
      }
      setInterim((finalRef.current + interimText).trim());
    };

    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        setErrorMsg('MIC ACCESS DENIED — ENABLE MICROPHONE IN BROWSER SETTINGS');
      } else if (ev.error === 'no-speech') {
        setErrorMsg('NO SPEECH DETECTED — HOLD THE BUTTON AND SPEAK');
      } else if (ev.error !== 'aborted') {
        setErrorMsg('AUDIO LINK ERROR — TRY AGAIN');
      }
    };

    // onend fires after stop() once all pending results are flushed —
    // this is the single point where the message actually gets sent.
    rec.onend = () => {
      listeningRef.current = false;
      recRef.current = null;
      setInterim('');
      const text = finalRef.current.trim();
      finalRef.current = '';
      if (modeRef.current !== 'on') return;
      if (text) {
        handleSend(text);
      } else {
        setVoiceState('idle');
      }
    };

    try {
      rec.start();
      recRef.current = rec;
      listeningRef.current = true;
      setVoiceState('listening');
      setInterim('');
      setErrorMsg('');
    } catch {
      // start() throws if a session is already active — ignore
    }
  }, [supported, handleSend]);

  // ── Push-to-talk: stop listening ──────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (!listeningRef.current) return;
    try { recRef.current?.stop(); } catch { /* already stopped */ }
  }, []);

  // ── Talk button pointer handlers (walkie-talkie behaviour) ────────────────
  const onTalkDown = useCallback((e) => {
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* noop */ }
    startListening();
  }, [startListening]);

  const onTalkUp = useCallback((e) => {
    e.preventDefault();
    stopListening();
  }, [stopListening]);

  // ── Hardware volume keys (progressive enhancement) ────────────────────────
  // NOTE: most mobile browsers do NOT expose volume keys to JS (iOS Safari
  // never, Android Chrome inconsistently). Harmless when unavailable — the
  // on-screen button remains the primary control.
  useEffect(() => {
    if (mode !== 'on' || !supported) return;

    const onKeyDown = (e) => {
      if (!isVolumeKey(e)) return;
      e.preventDefault();
      if (e.repeat || volKeyHeldRef.current) return; // guard key auto-repeat
      volKeyHeldRef.current = true;
      startListening();
    };
    const onKeyUp = (e) => {
      if (!isVolumeKey(e)) return;
      e.preventDefault();
      volKeyHeldRef.current = false;
      stopListening();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      volKeyHeldRef.current = false;
    };
  }, [mode, supported, startListening, stopListening]);

  // ── activate ──────────────────────────────────────────────────────────────
  const activate = useCallback(async () => {
    if (modeRef.current !== 'off') return;

    // Unlock iOS speechSynthesis while we're still inside the user's tap —
    // a silent utterance now allows the async reply to be spoken later.
    try {
      const synth = window.speechSynthesis;
      if (synth) {
        const unlock = new SpeechSynthesisUtterance(' ');
        unlock.volume = 0;
        synth.speak(unlock);
        synth.getVoices(); // warm the voice list (async-populated on iOS/Chrome)
      }
    } catch { /* non-fatal */ }

    setMode('booting');
    setBootLines([]);
    setBootDone(false);
    setErrorMsg('');
    setVoiceState('idle');

    // Stagger boot lines for the cinematic typewriter effect
    BOOT_LINES.forEach(({ text, delay }) => {
      timersRef.current.push(
        setTimeout(() => setBootLines(prev => [...prev, text]), delay)
      );
    });

    timersRef.current.push(setTimeout(() => {
      setBootDone(true);
      timersRef.current.push(setTimeout(() => {
        setMode('on');
      }, 700));
    }, MIN_BOOT_MS));
  }, []);

  // ── deactivate ────────────────────────────────────────────────────────────
  const deactivate = useCallback(() => {
    clearTimers();
    try { recRef.current?.abort(); } catch { /* noop */ }
    recRef.current = null;
    listeningRef.current = false;
    finalRef.current = '';
    busyRef.current = false;
    window.speechSynthesis?.cancel();
    setMode('off');
    setBootLines([]);
    setBootDone(false);
    setVoiceState('idle');
    setInterim('');
    setErrorMsg('');
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimers();
    try { recRef.current?.abort(); } catch { /* noop */ }
    window.speechSynthesis?.cancel();
  }, []);

  useImperativeHandle(ref, () => ({ activate, deactivate }), [activate, deactivate]);

  const isOn      = mode === 'on';
  const isBooting = mode === 'booting';
  const listening = voiceState === 'listening';
  const thinking  = voiceState === 'thinking' || isLoading;
  const speaking  = voiceState === 'speaking';

  const statusLabel = !supported
    ? 'UNSUPPORTED'
    : listening ? 'LISTENING'
    : thinking  ? 'PROCESSING'
    : speaking  ? 'TRANSMITTING'
    : 'STANDBY';

  if (mode === 'off') return null;

  // ───────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Boot / loading screen ──────────────────────────────────────────── */}
      {isBooting && (
        <div className={`jv-boot${bootDone ? ' jv-boot--done' : ''}`}>
          <div className="jv-scanlines" aria-hidden="true" />
          <div className="jv-boot__reactor" aria-hidden="true">
            <div className="jv-boot__ring jv-boot__ring--1" />
            <div className="jv-boot__ring jv-boot__ring--2" />
            <div className="jv-boot__core" />
          </div>
          <div className="jv-boot__log">
            {bootLines.map((line, i) => (
              <div
                key={i}
                className={`jv-boot__log-line${
                  i === bootLines.length - 1 ? ' jv-boot__log-line--active' : ''
                }`}
              >
                {line}
              </div>
            ))}
            {bootLines.length > 0 && !bootDone && (
              <span className="jv-boot__cursor">_</span>
            )}
          </div>
          <div className="jv-corner jv-corner--tl" aria-hidden="true" />
          <div className="jv-corner jv-corner--tr" aria-hidden="true" />
          <div className="jv-corner jv-corner--bl" aria-hidden="true" />
          <div className="jv-corner jv-corner--br" aria-hidden="true" />
        </div>
      )}

      {/* ── Voice HUD ──────────────────────────────────────────────────────── */}
      {isOn && (
        <div className="jv-hud">
          <div className="jv-scanlines" aria-hidden="true" />
          <div className="jv-corner jv-corner--tl" aria-hidden="true" />
          <div className="jv-corner jv-corner--tr" aria-hidden="true" />
          <div className="jv-corner jv-corner--bl" aria-hidden="true" />
          <div className="jv-corner jv-corner--br" aria-hidden="true" />

          {/* Status bar */}
          <div className="jv-status" aria-live="polite">
            <span className="jv-status__title">JARVIS VOICE LINK</span>
            <span
              className={`jv-status__badge${
                listening ? ' jv-status__badge--listening' :
                speaking  ? ' jv-status__badge--speaking'  : ''
              }`}
            >
              {statusLabel}
            </span>
            <button className="jv-exit" onClick={deactivate}>EXIT</button>
          </div>

          {/* Conversation transcript — bound to shared ChatContext messages */}
          <div className="jv-transcript" ref={transcriptRef}>
            {messages.length === 0 && !interim && (
              <div className="jv-transcript__empty">
                {supported
                  ? '// HOLD THE BUTTON BELOW AND SPEAK'
                  : '// VOICE LINK UNAVAILABLE ON THIS BROWSER'}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`jv-msg ${m.role === 'user' ? 'jv-msg--user' : 'jv-msg--ai'}`}
              >
                <span className="jv-msg__tag">
                  {m.role === 'user' ? 'YOU' : 'JARVIS'}
                </span>
                <span className="jv-msg__text">{m.content}</span>
              </div>
            ))}
            {interim && (
              <div className="jv-msg jv-msg--user jv-msg--interim">
                <span className="jv-msg__tag">YOU</span>
                <span className="jv-msg__text">{interim}</span>
              </div>
            )}
            {thinking && (
              <div className="jv-msg jv-msg--ai jv-msg--thinking">
                <span className="jv-msg__tag">JARVIS</span>
                <span className="jv-msg__text">PROCESSING<span className="jv-ellipsis" /></span>
              </div>
            )}
          </div>

          {/* Error / fallback line */}
          {!supported && (
            <div className="jv-error">
              SPEECH RECOGNITION NOT SUPPORTED ON THIS BROWSER —
              USE THE zac.ai CHAT INSTEAD
            </div>
          )}
          {supported && errorMsg && <div className="jv-error">{errorMsg}</div>}

          {/* Push-to-talk control */}
          <div className="jv-talk-zone">
            {listening && (
              <span className="jv-talk__pulse" aria-hidden="true" />
            )}
            <button
              className={[
                'jv-talk',
                listening ? 'jv-talk--listening' : '',
                speaking  ? 'jv-talk--speaking'  : '',
                (!supported || thinking) ? 'jv-talk--disabled' : '',
              ].filter(Boolean).join(' ')}
              disabled={!supported || thinking}
              onPointerDown={onTalkDown}
              onPointerUp={onTalkUp}
              onPointerCancel={onTalkUp}
              onPointerLeave={onTalkUp}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Mic glyph */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="1.6"
                   strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="2.5" width="6" height="11" rx="3" />
                <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
                <line x1="12" y1="18" x2="12" y2="21" />
              </svg>
              <span className="jv-talk__label">
                {listening ? 'RELEASE TO SEND' : thinking ? 'STAND BY' : 'HOLD TO TALK'}
              </span>
            </button>
            <div className="jv-talk__hint">
              {supported
                ? 'PUSH-TO-TALK · WALKIE-TALKIE PROTOCOL'
                : 'VOICE INPUT OFFLINE'}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default JarvisVoice;
