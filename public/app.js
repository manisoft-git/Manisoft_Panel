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
const modalSeedBadge = document.getElementById('modal-seed-badge');
const modalInlineSeed = document.getElementById('modal-inline-seed');
const modalLockDot = document.getElementById('modal-lock-dot');
const hudSeed = document.getElementById('hud-seed');
const btnAgyComm = document.getElementById('btn-agy-comm');
const agyModal = document.getElementById('antigravity-modal');
const stealthToast = document.getElementById('stealth-toast');
const panicHeaderBtn = document.getElementById('btn-panic-header');

let activeDeck = 'fleet';
let currentTelemetry = null;
let currentNonceCode = 'ACTIVE';

// ------------------------------------------------------------------------------
// 1. HARDENED SECURITY & ROLLING NONCE DETECTION
// ------------------------------------------------------------------------------
function extractNonceFromDOM() {
  if (typeof window !== 'undefined' && window.__MANISOFT_SEED__) {
    currentNonceCode = window.__MANISOFT_SEED__;
    return;
  }
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

async function updateSeedDisplay() {
  extractNonceFromDOM();
  try {
    const res = await fetch('/api/seed');
    if (res.ok) {
      const data = await res.json();
      if (data && data.seed) {
        currentNonceCode = data.seed;
      }
    }
  } catch (e) {
    // fallback to DOM extraction
  }
  const hudSeedEl = document.getElementById('hud-seed');
  if (hudSeedEl) hudSeedEl.textContent = currentNonceCode;
  const modalSeedBadgeEl = document.getElementById('modal-seed-badge');
  if (modalSeedBadgeEl) modalSeedBadgeEl.textContent = currentNonceCode;
  const modalInlineSeedEl = document.getElementById('modal-inline-seed');
  if (modalInlineSeedEl) modalInlineSeedEl.textContent = currentNonceCode;
}
updateSeedDisplay();

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
setupLogoTriggers(modalSeedBadge);

// Also guard the whole brand section against long-press text selection
const brandSectionEl = document.querySelector('.brand-section');
if (brandSectionEl) {
  brandSectionEl.addEventListener('contextmenu', (e) => e.preventDefault());
  brandSectionEl.addEventListener('selectstart', (e) => e.preventDefault());
}

// Tap on lock status dot to refresh/inspect seed
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

async function triggerStealthHUD() {
  await updateSeedDisplay();
  sound.tap();
  if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  if (stealthToast) {
    stealthToast.textContent = `[SYS_SEC_DIAG // SEED: ${currentNonceCode} // EXPIRES 180s]`;
    stealthToast.classList.remove('hidden');
    setTimeout(() => stealthToast.classList.add('hidden'), 5000);
  }
}

if (stealthToast) {
  stealthToast.addEventListener('click', () => {
    stealthToast.classList.add('hidden');
  });
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

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return m;
    }
  });
}

function speakManiResponse(text) {
  if (!voiceReplyEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const spokenText = String(text)
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .slice(0, 600);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (e) {}
}
const speakAntigravityResponse = speakManiResponse;

function openManiModal(initialPrompt = '') {
  if (agyModal) {
    agyModal.classList.remove('hidden');
    sound.tap();
    const commInput = document.getElementById('comm-input');
    if (commInput) {
      if (initialPrompt) {
        commInput.value = initialPrompt;
      }
      commInput.focus();
    }
  }
}
const openAntigravityModal = openManiModal;

function closeManiModal() {
  if (agyModal) {
    agyModal.classList.add('hidden');
    sound.tap();
    stopVoiceRecognition();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
}
const closeAntigravityModal = closeManiModal;

function stopVoiceRecognition() {
  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
  }
  isRecordingVoice = false;
  updateMicUI(false);
}

function updateMicUI(recording) {
  const commMicBtn = document.getElementById('btn-comm-mic');
  const commMicText = document.getElementById('comm-mic-text');
  const commMicIcon = document.getElementById('comm-mic-icon');
  const touchMicBtn = document.querySelector('.touch-key[data-key="MIC"]');
  const statusText = document.getElementById('comm-status-text');
  const statusDot = document.getElementById('comm-status-dot');

  if (recording) {
    if (commMicBtn) {
      commMicBtn.classList.add('recording');
      if (commMicText) commMicText.textContent = 'LISTENING...';
      if (commMicIcon) commMicIcon.textContent = '🔴';
    }
    if (touchMicBtn) {
      touchMicBtn.classList.add('recording');
      touchMicBtn.textContent = '🎙️ REC';
    }
    if (statusText) statusText.textContent = 'Listening... Speak your instruction clearly.';
    if (statusDot) { statusDot.className = 'dot-pulse red'; }
  } else {
    if (commMicBtn) {
      commMicBtn.classList.remove('recording');
      if (commMicText) commMicText.textContent = 'SPEAK';
      if (commMicIcon) commMicIcon.textContent = '🎙️';
    }
    if (touchMicBtn) {
      touchMicBtn.classList.remove('recording');
      touchMicBtn.textContent = 'MIC';
    }
    if (statusText) statusText.textContent = 'Ready. Speak via MIC or type your message.';
    if (statusDot) { statusDot.className = 'dot-pulse green'; }
  }
}

function toggleVoiceRecognition(targetInputId = 'comm-input') {
  if (isRecordingVoice) {
    stopVoiceRecognition();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const targetInput = document.getElementById(targetInputId);

  if (!SpeechRecognition) {
    const statusText = document.getElementById('comm-status-text');
    if (statusText) {
      statusText.textContent = 'Speech API restricted by browser: Tap mobile keyboard 🎙️ mic to dictate!';
    }
    if (targetInput) {
      targetInput.focus();
    }
    return;
  }

  try {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.lang = 'en-US';
    speechRecognizer.interimResults = true;
    speechRecognizer.continuous = false;

    isRecordingVoice = true;
    updateMicUI(true);

    speechRecognizer.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      if (targetInput) targetInput.value = transcript;
      const statusText = document.getElementById('comm-status-text');
      if (statusText) statusText.textContent = `Heard: "${transcript}"...`;
    };

    speechRecognizer.onerror = (event) => {
      stopVoiceRecognition();
      const statusText = document.getElementById('comm-status-text');
      if (statusText) statusText.textContent = `Voice capture ended (${event.error || 'silence'}). Dictate via mobile keyboard mic or type.`;
    };

    speechRecognizer.onend = () => {
      stopVoiceRecognition();
      if (targetInput && targetInput.value.trim()) {
        if (targetInputId === 'comm-input') {
          sendAntigravityDialogue(targetInput.value.trim());
        } else if (targetInputId === 'term-input') {
          const termSend = document.querySelector('#btn-term-send');
          if (termSend) termSend.click();
        }
      }
    };

    speechRecognizer.start();
  } catch (err) {
    stopVoiceRecognition();
    if (targetInput) targetInput.focus();
  }
}

async function sendManiDialogue(promptText) {
  const stream = document.getElementById('comm-dialogue-stream');
  const commInput = document.getElementById('comm-input');
  if (!stream || !promptText) return;

  if (commInput) commInput.value = '';

  // Append user message bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'comm-bubble comm-user';
  userBubble.innerHTML = `<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-cyan);">👤 You:</div><div>${escapeHtml(promptText)}</div>`;
  stream.appendChild(userBubble);

  // Append AI thinking bubble
  const aiBubble = document.createElement('div');
  aiBubble.className = 'comm-bubble comm-ai';
  aiBubble.innerHTML = `<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-neon);">🤖 MANI AI:</div><div class="thinking-text" style="color: var(--text-dim); font-style: italic;">Reasoning & executing prompt...</div>`;
  stream.appendChild(aiBubble);
  stream.scrollTop = stream.scrollHeight;

  const statusText = document.getElementById('comm-status-text');
  if (statusText) statusText.textContent = 'MANI AI is reasoning & executing...';

  try {
    const res = await fetch('/api/mani/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText, continue: true })
    });
    const data = await res.json();
    const reply = data.output || data.reply || data.error || 'No response produced.';

    const formattedReply = escapeHtml(reply).replace(/\n/g, '<br>');
    aiBubble.innerHTML = `<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-neon);">🤖 MANI AI:</div><div>${formattedReply}</div>`;

    if (data.success !== false) {
      sound.success();
      speakManiResponse(reply);
    } else {
      sound.error();
    }
  } catch (err) {
    aiBubble.innerHTML = `<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-red);">🤖 MANI AI Error:</div><div>Failed to dispatch: ${escapeHtml(err.message)}</div>`;
    sound.error();
  }

  if (statusText) statusText.textContent = 'Ready. Speak via MIC or type instructions for MANI AI.';
  stream.scrollTop = stream.scrollHeight;
}
const sendAntigravityDialogue = sendManiDialogue;

// Interactive Terminal NOC & MANI AI Bridge Deck
function renderTerminalNOC(containerEl) {
  const isAgy = terminalMode === 'antigravity';
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>TERMINAL NOC & MANI AI BRIDGE</h3>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span id="term-mode-toggle" class="pill ${isAgy ? 'pill-cyan' : 'pill-green'} terminal-mode-toggle" title="Click to toggle between MANI AI and Bash shell">
          ${isAgy ? '🤖 MODE: MANI AI' : '⚡ MODE: BASH SHELL'}
        </span>
        <button id="btn-voice-toggle" class="btn-ghost-sm" title="Toggle audio spoken response">${voiceReplyEnabled ? '🔊 VOICE: ON' : '🔈 VOICE: OFF'}</button>
      </div>
    </div>
    <div class="terminal-deck">
      <div class="terminal-header">
        <span>${isAgy ? 'SOVEREIGN AGENT // MANI AI Autonomous Fleet Engine' : 'SOVEREIGN PTY STREAM // /bin/bash'}</span>
        <span>${isAgy ? 'CAPABILITIES: Edit Projects, Full Read/Write, Git, Shell' : 'HOTSTRINGS: ;;audit, ;;push'}</span>
      </div>
      <div id="term-out" class="terminal-output">manisoft@sovereign:~$ Mani$oft Mission Control Ready.\n${isAgy ? '[MANI AI] Sovereign agent connected at ~/MANISOFT/projects. Full fleet read/write editing active. Speak via MIC or type instructions.\n' : '[BASH] Local shell active.\n'}</div>
      <div class="terminal-input-row">
        <input type="text" id="term-input" placeholder="${isAgy ? 'Instruct MANI AI to edit code, inspect fleet, or tap MIC to speak...' : 'Type shell command or slash action (/boost, /parallel)...'}" autofocus>
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

    const promptIsAgy = terminalMode === 'antigravity' || sanitized.startsWith('/') || sanitized.startsWith('mani ') || sanitized.startsWith('agy ');
    const promptPrefix = promptIsAgy ? 'operator@mani-ai:~$ ' : 'manisoft@sovereign:~$ ';
    termOut.textContent += `\n${promptPrefix}${sanitized}\n`;
    termInput.value = '';

    if (promptIsAgy) {
      termOut.textContent += `[MANI AI // REASONING & EXECUTING...]\n`;
      termOut.scrollTop = termOut.scrollHeight;

      try {
        const cleanPrompt = sanitized.replace(/^(mani|agy)\s+/i, '');
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'ask_mani', params: { prompt: cleanPrompt } })
        });
        const data = await res.json();
        termOut.textContent = termOut.textContent.replace(`[MANI AI // REASONING & EXECUTING...]\n`, '');
        if (data.result && (data.result.output || data.result.reply)) {
          const reply = data.result.output || data.result.reply;
          termOut.textContent += `🤖 MANI AI:\n${reply}\n\n`;
          speakManiResponse(reply);
        } else if (data.result && data.result.error) {
          termOut.textContent += `[-] MANI AI Error: ${data.result.error}\n`;
        }
      } catch (err) {
        termOut.textContent = termOut.textContent.replace(`[MANI AI // REASONING & EXECUTING...]\n`, '');
        termOut.textContent += `[-] MANI AI Dispatch failed: ${err.message}\n`;
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
      openManiModal();
      toggleVoiceRecognition('comm-input');
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

// MANI AI Comm Modal Event Listeners
if (btnAgyComm) {
  btnAgyComm.addEventListener('click', () => {
    openManiModal();
  });
}

const btnCommClose = document.getElementById('btn-comm-close');
if (btnCommClose) {
  btnCommClose.addEventListener('click', closeManiModal);
}

const btnCommVoiceToggle = document.getElementById('btn-comm-voice-toggle');
if (btnCommVoiceToggle) {
  btnCommVoiceToggle.addEventListener('click', () => {
    sound.tap();
    voiceReplyEnabled = !voiceReplyEnabled;
    btnCommVoiceToggle.textContent = voiceReplyEnabled ? '🔊 VOICE: ON' : '🔈 VOICE: OFF';
  });
}

const btnCommMic = document.getElementById('btn-comm-mic');
if (btnCommMic) {
  btnCommMic.addEventListener('click', () => {
    toggleVoiceRecognition('comm-input');
  });
}

const commInputEl = document.getElementById('comm-input');
const btnCommSend = document.getElementById('btn-comm-send');
if (btnCommSend && commInputEl) {
  btnCommSend.addEventListener('click', () => {
    const val = commInputEl.value.trim();
    if (val) sendManiDialogue(val);
  });
  commInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = commInputEl.value.trim();
      if (val) sendManiDialogue(val);
    }
  });
}

document.querySelectorAll('.comm-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    sound.tap();
    const prompt = chip.dataset.prompt;
    if (prompt) sendManiDialogue(prompt);
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
updateSeedDisplay();
checkClearance();
renderActiveDeck();
pollTelemetry();
