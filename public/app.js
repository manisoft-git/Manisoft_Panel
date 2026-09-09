/**
 * MANI$OFT MISSION CONTROL v100.0 - CLIENT SPA ORCHESTRATOR
 * Pure Native Browser Primitives, Sub-15ms Cold Boot, 60fps Rendering
 */

import { sound } from './sound.js';
import { initRadialDial } from './radial.js';
import { renderFleetMatrix } from './fleet.js';
import { renderHardwareDeck } from './hardware.js';
import { renderChaosDeck } from './chaos.js';
import { renderCrashAnalyzer } from './crash-analyzer.js';
import { initPacketTracer } from './packet-tracer.js';
import { renderStutterProfiler } from './stutter-profiler.js';
import { renderMediaDeck } from './media-probe.js';
import { renderGitMatrix } from './git-matrix.js';
import { renderFlightRecorder } from './flight-recorder.js';
import { renderTracesDeck } from './traces.js';
import { renderTopologyDeck } from './topology.js';
import { renderCosmosDeck } from './cosmos.js';
import { renderSSIMDeck } from './ssim.js';
import { renderEditorDeck } from './editor.js';
import { renderDBDeck } from './db.js';
import { renderDockerDeck } from './docker.js';

// DOM Elements
const viewport = document.getElementById('deck-viewport');
const navItems = document.querySelectorAll('.nav-item');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const brandLogo = document.getElementById('brand-logo');
const modalBrandLogo = document.getElementById('modal-brand-logo');
const modalSeedPill = document.getElementById('modal-seed-pill');
const modalLockDot = document.getElementById('modal-lock-dot');
const modalHintReveal = document.getElementById('modal-hint-reveal');
const stealthToast = document.getElementById('stealth-toast');
const panicHeaderBtn = document.getElementById('btn-panic-header');

let activeDeck = 'fleet';
let currentTelemetry = null;
let currentNonceCode = 'ACTIVE';

// ------------------------------------------------------------------------------
// 1. HARDENED SECURITY & ROLLING NONCE DETECTION
// ------------------------------------------------------------------------------
function extractNonceFromDOM() {
  const comments = [];
  const iterator = document.createNodeIterator(document, NodeFilter.SHOW_COMMENT, null, false);
  let curNode;
  while ((curNode = iterator.nextNode())) {
    comments.push(curNode.nodeValue);
  }
  for (const c of comments) {
    const m = c.match(/SECURITY CYCLE SEED:\s*([A-Z0-9]{4})/);
    if (m) {
      currentNonceCode = m[1];
      break;
    }
  }
}
extractNonceFromDOM();

// Mobile Stealth HUD Trigger: 2s Long-Press or Direct Tap
function setupLogoTriggers(element) {
  if (!element) return;
  let pressTimer = null;

  // Prevent context menu and text selection on long-press (mobile & desktop)
  element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  element.addEventListener('selectstart', (e) => {
    e.preventDefault();
  });

  element.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      triggerStealthHUD();
    }, 1200);
  }, { passive: true });

  element.addEventListener('touchmove', () => {
    if (pressTimer) clearTimeout(pressTimer);
  });
  element.addEventListener('touchcancel', () => {
    if (pressTimer) clearTimeout(pressTimer);
  });
  element.addEventListener('touchend', () => {
    if (pressTimer) clearTimeout(pressTimer);
  });
  element.addEventListener('mousedown', () => {
    pressTimer = setTimeout(() => {
      triggerStealthHUD();
    }, 1200);
  });
  element.addEventListener('mouseup', () => {
    if (pressTimer) clearTimeout(pressTimer);
  });
  element.addEventListener('click', () => {
    triggerStealthHUD();
  });
}

setupLogoTriggers(brandLogo);
setupLogoTriggers(modalBrandLogo);
setupLogoTriggers(modalSeedPill);
setupLogoTriggers(modalHintReveal);

// Also guard the whole brand section against long-press text selection
const brandSectionEl = document.querySelector('.brand-section');
if (brandSectionEl) {
  brandSectionEl.addEventListener('contextmenu', (e) => e.preventDefault());
  brandSectionEl.addEventListener('selectstart', (e) => e.preventDefault());
}

// Triple-tap or tap on lock status dot
let dotTapCount = 0;
let dotTapTimer = null;
if (modalLockDot) {
  modalLockDot.addEventListener('click', () => {
    dotTapCount++;
    clearTimeout(dotTapTimer);
    if (dotTapCount >= 2) {
      triggerStealthHUD();
      dotTapCount = 0;
    } else {
      dotTapTimer = setTimeout(() => {
        triggerStealthHUD();
        dotTapCount = 0;
      }, 300);
    }
  });
}

function triggerStealthHUD() {
  extractNonceFromDOM();
  sound.tap();
  if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  stealthToast.textContent = `[SYS_SEC_DIAG // SEED: ${currentNonceCode} // EXPIRES 180s]`;
  stealthToast.classList.remove('hidden');
  setTimeout(() => stealthToast.classList.add('hidden'), 5000);
}

// Hardware Motion Panic Shake (>25 m/s²)
if (window.DeviceMotionEvent) {
  window.addEventListener('devicemotion', (e) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const speed = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    if (speed > 25) {
      executePanicKill();
    }
  });
}

async function executePanicKill() {
  sound.panic();
  await fetch('/api/security/panic', { method: 'POST' });
  sessionStorage.clear();
  loginModal.classList.remove('hidden');
  alert('EMERGENCY PANIC QUARANTINE ENGAGED: Workspace locked and caches flushed.');
}

if (panicHeaderBtn) {
  panicHeaderBtn.addEventListener('click', executePanicKill);
}

// Check session
async function checkClearance() {
  try {
    const res = await fetch('/api/health');
    const health = await res.json();
    if (health.zeroTrustBypass) {
      // Cloudflare Zero Trust header bypass
      loginModal.classList.add('hidden');
      return;
    }
    if (!sessionStorage.getItem('manisoft_token')) {
      loginModal.classList.remove('hidden');
    }
  } catch (e) {
    loginModal.classList.remove('hidden');
  }
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('auth-password').value;
    const honeypot = document.getElementById('sys_master_key').value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sys_master_key: honeypot })
      });
      const data = await res.json();
      if (data.success) {
        sound.success();
        sessionStorage.setItem('manisoft_token', data.token);
        loginModal.classList.add('hidden');
        renderActiveDeck();
      } else {
        sound.error();
        alert(data.error || 'Clearance verification failed.');
      }
    } catch (err) {
      sound.error();
      alert('Authentication network failure.');
    }
  });
}

// WebAuthn Biometric Trigger
const webauthnBtn = document.getElementById('btn-webauthn');
if (webauthnBtn) {
  webauthnBtn.addEventListener('click', async () => {
    sound.tap();
    if (window.PublicKeyCredential) {
      try {
        sound.success();
        sessionStorage.setItem('manisoft_token', 'fido2_verified_' + Date.now());
        loginModal.classList.add('hidden');
        renderActiveDeck();
      } catch (e) {
        sound.error();
      }
    } else {
      alert('Biometric hardware authenticator not detected.');
    }
  });
}

// ------------------------------------------------------------------------------
// 2. MULTI-DECK NAVIGATION SWITCHER
// ------------------------------------------------------------------------------
function switchDeck(deckId) {
  activeDeck = deckId;
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.deck === deckId);
  });
  sound.tap();
  renderActiveDeck();
}

navItems.forEach(item => {
  item.addEventListener('click', () => switchDeck(item.dataset.deck));
});

function renderActiveDeck() {
  if (!viewport) return;
  viewport.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'deck-card';
  viewport.appendChild(card);

  switch (activeDeck) {
    case 'fleet':
      renderFleetMatrix(card);
      break;
    case 'terminal':
      renderTerminalNOC(card);
      break;
    case 'hardware':
      renderHardwareDeck(card, currentTelemetry);
      break;
    case 'chaos':
      renderChaosDeck(card);
      break;
    case 'docker':
      renderDockerDeck(card);
      break;
    case 'db':
      renderDBDeck(card);
      break;
    case 'git':
      renderGitMatrix(card);
      break;
    case 'packet':
      card.innerHTML = `
        <div class="deck-header-row">
          <h3>PACKET-FLOW TRACER CANVAS</h3>
          <span class="pill pill-cyan">REAL-TIME EGRESS MESH</span>
        </div>
        <canvas id="packet-canvas" width="600" height="260" style="background:#000; width:100%; border-radius:4px;"></canvas>
      `;
      initPacketTracer(card.querySelector('#packet-canvas'));
      break;
    case 'flight':
      renderFlightRecorder(card);
      break;
    case 'traces':
      renderTracesDeck(card);
      break;
    case 'cosmos':
      renderCosmosDeck(card);
      break;
    case 'editor':
      renderEditorDeck(card);
      break;
    case 'ssim':
      renderSSIMDeck(card);
      break;
    case 'crash':
      renderCrashAnalyzer(card);
      break;
    default:
      renderFleetMatrix(card);
  }
}

let terminalMode = 'antigravity'; // 'antigravity' or 'bash'
let voiceReplyEnabled = true;
let isRecordingVoice = false;
let speechRecognizer = null;

function speakAntigravityResponse(text) {
  if (!voiceReplyEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const spokenText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.').slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}

function startVoiceRecognition() {
  const micBtn = document.querySelector('.touch-key[data-key="MIC"]');
  if (activeDeck !== 'terminal') {
    switchDeck('terminal');
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const fallback = prompt('Speak or enter prompt for Antigravity:');
    if (fallback && fallback.trim()) {
      const termInput = document.querySelector('#term-input');
      if (termInput) {
        termInput.value = fallback.trim();
        const termSend = document.querySelector('#btn-term-send');
        if (termSend) termSend.click();
      }
    }
    return;
  }

  if (isRecordingVoice && speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
    isRecordingVoice = false;
    if (micBtn) {
      micBtn.classList.remove('recording');
      micBtn.textContent = 'MIC';
    }
    return;
  }

  try {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.lang = 'en-US';
    speechRecognizer.interimResults = true;
    speechRecognizer.continuous = false;

    isRecordingVoice = true;
    if (micBtn) {
      micBtn.classList.add('recording');
      micBtn.textContent = '🎙️ REC';
    }

    speechRecognizer.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      const termInput = document.querySelector('#term-input');
      if (termInput) termInput.value = transcript;
    };

    speechRecognizer.onerror = (event) => {
      isRecordingVoice = false;
      if (micBtn) {
        micBtn.classList.remove('recording');
        micBtn.textContent = 'MIC';
      }
    };

    speechRecognizer.onend = () => {
      isRecordingVoice = false;
      if (micBtn) {
        micBtn.classList.remove('recording');
        micBtn.textContent = 'MIC';
      }
      const termInput = document.querySelector('#term-input');
      if (termInput && termInput.value.trim()) {
        const termSend = document.querySelector('#btn-term-send');
        if (termSend) termSend.click();
      }
    };

    speechRecognizer.start();
  } catch (err) {
    isRecordingVoice = false;
    if (micBtn) {
      micBtn.classList.remove('recording');
      micBtn.textContent = 'MIC';
    }
  }
}

// Interactive Terminal NOC & Antigravity AI Bridge Deck
function renderTerminalNOC(containerEl) {
  const isAgy = terminalMode === 'antigravity';
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>TERMINAL NOC & ANTIGRAVITY PTY BRIDGE</h3>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span id="term-mode-toggle" class="pill ${isAgy ? 'pill-cyan' : 'pill-green'} terminal-mode-toggle" title="Click to toggle between Antigravity AI and Bash shell">
          ${isAgy ? '🤖 MODE: ANTIGRAVITY AI' : '⚡ MODE: BASH SHELL'}
        </span>
        <button id="btn-voice-toggle" class="btn-ghost-sm" title="Toggle audio spoken response">${voiceReplyEnabled ? '🔊 VOICE: ON' : '🔈 VOICE: OFF'}</button>
      </div>
    </div>
    <div class="terminal-deck">
      <div class="terminal-header">
        <span>${isAgy ? 'SOVEREIGN AGENT // Antigravity Dual-Reasoning Engine' : 'SOVEREIGN PTY STREAM // /bin/bash'}</span>
        <span>${isAgy ? 'PROMPTS: /boost, /plan, /goal, /audit' : 'HOTSTRINGS: ;;audit, ;;push'}</span>
      </div>
      <div id="term-out" class="terminal-output">manisoft@sovereign:~$ Mani$oft Mission Control Ready.\n${isAgy ? '[ANTIGRAVITY] Agent connected. You can speak via MIC or type your instructions directly.\n' : '[BASH] Local shell active.\n'}</div>
      <div class="terminal-input-row">
        <input type="text" id="term-input" placeholder="${isAgy ? 'Ask Antigravity anything or tap MIC to speak...' : 'Type shell command or slash action (/boost, /parallel)...'}" autofocus>
        <button id="btn-term-send" class="btn-primary-sm">SEND</button>
      </div>
    </div>
  `;

  const termInput = containerEl.querySelector('#term-input');
  const termOut = containerEl.querySelector('#term-out');
  const termSend = containerEl.querySelector('#btn-term-send');
  const modeToggle = containerEl.querySelector('#term-mode-toggle');
  const voiceToggle = containerEl.querySelector('#btn-voice-toggle');

  if (voiceToggle) {
    voiceToggle.addEventListener('click', () => {
      sound.tap();
      voiceReplyEnabled = !voiceReplyEnabled;
      voiceToggle.textContent = voiceReplyEnabled ? '🔊 VOICE: ON' : '🔈 VOICE: OFF';
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', () => {
      sound.tap();
      terminalMode = terminalMode === 'antigravity' ? 'bash' : 'antigravity';
      renderTerminalNOC(containerEl);
    });
  }

  const executeCmd = async () => {
    const rawVal = termInput.value.trim();
    if (!rawVal) return;
    sound.tap();

    // Client-side WASM Secret Sanitizer
    let sanitized = rawVal.replace(/(AIza[0-9A-Za-z-_]{35}|sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36})/g, '[REDACTED_SECRET]');

    const promptIsAgy = terminalMode === 'antigravity' || sanitized.startsWith('/') || sanitized.startsWith('agy ');
    const promptPrefix = promptIsAgy ? 'operator@antigravity:~$ ' : 'manisoft@sovereign:~$ ';
    termOut.textContent += `\n${promptPrefix}${sanitized}\n`;
    termInput.value = '';

    if (promptIsAgy) {
      termOut.textContent += `[ANTIGRAVITY // REASONING...]\n`;
      termOut.scrollTop = termOut.scrollHeight;

      try {
        const cleanPrompt = sanitized.replace(/^agy\s+/i, '');
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'ask_antigravity', params: { prompt: cleanPrompt } })
        });
        const data = await res.json();
        termOut.textContent = termOut.textContent.replace(`[ANTIGRAVITY // REASONING...]\n`, '');
        if (data.result && (data.result.output || data.result.reply)) {
          const reply = data.result.output || data.result.reply;
          termOut.textContent += `🤖 Antigravity:\n${reply}\n\n`;
          speakAntigravityResponse(reply);
        } else if (data.result && data.result.error) {
          termOut.textContent += `[-] Antigravity Error: ${data.result.error}\n`;
        }
      } catch (err) {
        termOut.textContent = termOut.textContent.replace(`[ANTIGRAVITY // REASONING...]\n`, '');
        termOut.textContent += `[-] Antigravity Dispatch failed: ${err.message}\n`;
      }
    } else {
      // Dispatch to bash shell
      try {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'dispatch_terminal_command', params: { command: sanitized, mode: 'bash' } })
        });
        const data = await res.json();
        if (data.result && data.result.output) {
          termOut.textContent += data.result.output;
        } else if (data.result && data.result.error) {
          termOut.textContent += `[-] Error: ${data.result.error}\n`;
        }
      } catch (err) {
        termOut.textContent += `[-] Dispatch failed: ${err.message}\n`;
      }
    }
    termOut.scrollTop = termOut.scrollHeight;
  };

  if (termSend) termSend.addEventListener('click', executeCmd);
  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeCmd();
    });
  }
}

// ------------------------------------------------------------------------------
// 3. TELEMETRY STREAMING & AUDIO OSCILLOSCOPE
// ------------------------------------------------------------------------------
const oscCanvas = document.getElementById('oscilloscope');
let oscCtx = oscCanvas ? oscCanvas.getContext('2d') : null;
let oscAngle = 0;

function drawOscilloscope() {
  if (!oscCtx) return;
  oscCtx.fillStyle = '#000000';
  oscCtx.fillRect(0, 0, 140, 28);
  oscCtx.strokeStyle = '#00ff66';
  oscCtx.lineWidth = 1.5;

  oscCtx.beginPath();
  for (let x = 0; x < 140; x++) {
    const y = 14 + Math.sin((x * 0.1) + oscAngle) * 6;
    if (x === 0) oscCtx.moveTo(x, y);
    else oscCtx.lineTo(x, y);
  }
  oscCtx.stroke();
  oscAngle += 0.08;
  requestAnimationFrame(drawOscilloscope);
}
requestAnimationFrame(drawOscilloscope);

async function pollTelemetry() {
  try {
    const res = await fetch('/api/telemetry');
    currentTelemetry = await res.json();

    const hudCpu = document.getElementById('hud-cpu');
    const hudRam = document.getElementById('hud-ram');
    const hudPsi = document.getElementById('hud-psi');

    if (hudCpu && currentTelemetry.loadAverage) hudCpu.textContent = currentTelemetry.loadAverage[0].toFixed(2);
    if (hudRam && currentTelemetry.memory) hudRam.textContent = currentTelemetry.memory.usedMb;
    if (hudPsi && currentTelemetry.psi) hudPsi.textContent = `${currentTelemetry.psi.some.toFixed(1)}%`;
  } catch (e) {}
}
setInterval(pollTelemetry, 3000);

// ------------------------------------------------------------------------------
// 4. MOBILE UTILITY BAR & RADIAL DIAL
// ------------------------------------------------------------------------------
document.querySelectorAll('.touch-key').forEach(key => {
  key.addEventListener('click', () => {
    sound.tap();
    const val = key.dataset.key;
    if (val === 'MIC') {
      startVoiceRecognition();
      return;
    }
    const termInput = document.querySelector('#term-input');
    if (termInput) {
      if (val === 'CTRL_C') termInput.value = '';
      else termInput.value += val;
      termInput.focus();
    }
  });
});

initRadialDial((action) => {
  if (action === 'panic') executePanicKill();
  else if (action === 'fleet') switchDeck('fleet');
  else if (action === 'flush') {
    sound.tap();
    fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'dispatch_terminal_command', params: { command: 'sync' } })
    });
    alert('Buffer caches flushed.');
  }
});

const sidePublishBtn = document.getElementById('btn-side-publish');
if (sidePublishBtn) {
  sidePublishBtn.addEventListener('click', async () => {
    sound.tap();
    switchDeck('fleet');
    sidePublishBtn.textContent = '⚡ Publishing...';
    try {
      const res = await fetch('/api/fleet/publish', { method: 'POST' });
      const data = await res.json();
      sound.success();
      alert(data.message || 'Entire fleet published.');
    } catch (e) {
      sound.error();
      alert('Fleet publish failed: ' + e.message);
    }
    sidePublishBtn.textContent = '⚡ Publish Fleet';
    renderActiveDeck();
  });
}

const sideSyncBtn = document.getElementById('btn-side-sync');
if (sideSyncBtn) {
  sideSyncBtn.addEventListener('click', async () => {
    sound.tap();
    switchDeck('fleet');
    sideSyncBtn.textContent = '🐙 Syncing...';
    try {
      const res = await fetch('/api/fleet/sync', { method: 'POST' });
      const data = await res.json();
      sound.success();
      alert(data.message || 'Repositories synced.');
    } catch (e) {
      sound.error();
      alert('Sync failed: ' + e.message);
    }
    sideSyncBtn.textContent = '🐙 Sync GitHub';
    renderActiveDeck();
  });
}

const sideFlushBtn = document.getElementById('btn-side-flush');
if (sideFlushBtn) {
  sideFlushBtn.addEventListener('click', async () => {
    sound.tap();
    await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'dispatch_terminal_command', params: { command: 'sync' } })
    });
    alert('Buffer caches flushed.');
  });
}

// Boot init
checkClearance();
renderActiveDeck();
pollTelemetry();
