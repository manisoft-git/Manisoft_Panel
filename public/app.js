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

// Phone & Tablet Hardware Detection Engine
function isPhoneOrTablet() {
  const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet|silk|kindle/i.test(ua);
  const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return isMobileUA || (hasTouch && isCoarse) || (hasTouch && window.innerWidth <= 1024);
}

let seedRevealTimeout = null;

function hideSeedDisplay() {
  const hudSeedEl = document.getElementById('hud-seed');
  if (hudSeedEl) hudSeedEl.textContent = '----';
  const modalSeedBadgeEl = document.getElementById('modal-seed-badge');
  if (modalSeedBadgeEl) modalSeedBadgeEl.textContent = '----';
  const modalInlineSeedEl = document.getElementById('modal-inline-seed');
  if (modalInlineSeedEl) modalInlineSeedEl.textContent = '----';
  if (stealthToast) stealthToast.classList.add('hidden');
}

// STRICT RULE: Seed only reveals when logo is clicked on phone or tablets
async function revealSeedOnMobile() {
  // If desktop PC / laptop: DO NOT show seed on screen
  if (!isPhoneOrTablet()) {
    sound.tap();
    if (stealthToast) {
      stealthToast.textContent = '[DESKTOP AIR-LOCK // SEED OBFUSCATED: INSPECT SOURCE Ctrl+U]';
      stealthToast.classList.remove('hidden');
      setTimeout(() => stealthToast.classList.add('hidden'), 4000);
    }
    return;
  }

  // On Phone or Tablet: Fetch freshest rolling seed
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

  sound.tap();
  if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

  // Reveal seed on screen
  const hudSeedEl = document.getElementById('hud-seed');
  if (hudSeedEl) hudSeedEl.textContent = currentNonceCode;
  const modalSeedBadgeEl = document.getElementById('modal-seed-badge');
  if (modalSeedBadgeEl) modalSeedBadgeEl.textContent = currentNonceCode;
  const modalInlineSeedEl = document.getElementById('modal-inline-seed');
  if (modalInlineSeedEl) modalInlineSeedEl.textContent = currentNonceCode;

  if (stealthToast) {
    stealthToast.textContent = `[SYS_SEC_DIAG // SEED: ${currentNonceCode} // EXPIRES 180s]`;
    stealthToast.classList.remove('hidden');
  }

  // Auto-hide after 8 seconds (reverts to ---- for security)
  clearTimeout(seedRevealTimeout);
  seedRevealTimeout = setTimeout(() => {
    hideSeedDisplay();
  }, 8000);
}

const triggerStealthHUD = revealSeedOnMobile;
const updateSeedDisplay = revealSeedOnMobile;

// On Initial Boot: Seed remains masked as '----'
extractNonceFromDOM();
hideSeedDisplay();

// Logo Triggers: Direct Tap or Long-Press
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
      revealSeedOnMobile();
    }, 800);
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
      revealSeedOnMobile();
    }, 800);
  });
  element.addEventListener('mouseup', () => {
    if (pressTimer) clearTimeout(pressTimer);
  });
  element.addEventListener('click', () => {
    revealSeedOnMobile();
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

// Tap on lock status dot to trigger on mobile
let dotTapCount = 0;
let dotTapTimer = null;
if (modalLockDot) {
  modalLockDot.addEventListener('click', () => {
    dotTapCount++;
    clearTimeout(dotTapTimer);
    if (dotTapCount >= 2) {
      revealSeedOnMobile();
      dotTapCount = 0;
    } else {
      dotTapTimer = setTimeout(() => {
        revealSeedOnMobile();
        dotTapCount = 0;
      }, 300);
    }
  });
}

if (stealthToast) {
  stealthToast.addEventListener('click', () => {
    hideSeedDisplay();
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

// Persistent Google Pro Session Management
function getStoredToken() {
  return localStorage.getItem('manisoft_token') || sessionStorage.getItem('manisoft_token') || '';
}

function setStoredToken(token, persistent = true) {
  if (!token) return;
  if (persistent) {
    localStorage.setItem('manisoft_token', token);
  }
  sessionStorage.setItem('manisoft_token', token);
}

function clearStoredToken() {
  localStorage.removeItem('manisoft_token');
  sessionStorage.removeItem('manisoft_token');
}

// Global API Fetch Interceptor: Automatically injects persistent Google Pro bearer token
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  const token = getStoredToken();
  if (token && typeof url === 'string' && url.startsWith('/api/')) {
    options.headers = options.headers || {};
    if (options.headers instanceof Headers) {
      if (!options.headers.has('Authorization')) options.headers.set('Authorization', `Bearer ${token}`);
      if (!options.headers.has('x-manisoft-token')) options.headers.set('x-manisoft-token', token);
    } else {
      if (!options.headers['Authorization']) options.headers['Authorization'] = `Bearer ${token}`;
      if (!options.headers['x-manisoft-token']) options.headers['x-manisoft-token'] = token;
    }
  }
  return originalFetch(url, options);
};

async function executePanicKill() {
  sound.panic();
  await fetch('/api/security/panic', { method: 'POST' });
  clearStoredToken();
  loginModal.classList.remove('hidden');
  alert('EMERGENCY PANIC QUARANTINE ENGAGED: Workspace locked and caches flushed.');
}

if (panicHeaderBtn) {
  panicHeaderBtn.addEventListener('click', executePanicKill);
}

// ------------------------------------------------------------------------------
// GOOGLE PRO OPERATOR AIR-LOCK & SESSION CLEARANCE
// ------------------------------------------------------------------------------
let googleAuthConfig = { googleClientId: null, operatorEmail: 'manifestsubeno@gmail.com', isConfigured: false, zeroTrust: false };

async function initGoogleAuth() {
  try {
    const res = await fetch('/api/auth/config');
    if (res.ok) {
      googleAuthConfig = await res.json();
    }
  } catch (e) {
    console.error('Failed to load auth config:', e);
  }

  const detectionText = document.getElementById('google-detection-text');
  const statusPill = document.getElementById('google-status-pill');

  if (googleAuthConfig.zeroTrust) {
    if (detectionText) detectionText.innerHTML = `<span style="color: var(--color-neon);">Cloudflare Zero Trust Active: Verified as <strong>${escapeHtml(googleAuthConfig.operatorEmail)}</strong></span>`;
    if (statusPill) { statusPill.textContent = 'ZERO TRUST OK'; statusPill.className = 'pill pill-green'; }
    return;
  }

  if (googleAuthConfig.googleClientId) {
    if (detectionText) detectionText.innerHTML = `<span style="color: var(--color-cyan);">Google Identity Active: Checking browser for <strong>${escapeHtml(googleAuthConfig.operatorEmail)}</strong>...</span>`;
    if (statusPill) { statusPill.textContent = 'GIS INITIALIZED'; statusPill.className = 'pill pill-cyan'; }
    setupGoogleGis();
  } else {
    if (detectionText) detectionText.innerHTML = `<span style="color: #f59e0b;">⚠️ Google Client ID required for automatic account detection. Setup below or enter Sovereign Master Pass-Seed.</span>`;
    if (statusPill) { statusPill.textContent = 'SETUP NEEDED'; statusPill.className = 'pill pill-amber'; }
  }
}

function setupGoogleGis() {
  if (!googleAuthConfig.googleClientId) return;
  const startGis = () => {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) return;
    try {
      google.accounts.id.initialize({
        client_id: googleAuthConfig.googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: true,
        cancel_on_tap_outside: false,
        context: 'signin'
      });

      const container = document.getElementById('g_id_signin_container');
      if (container) {
        container.innerHTML = '';
        google.accounts.id.renderButton(container, {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 280
        });
      }

      // Trigger Google One Tap for instant browser active account detection
      google.accounts.id.prompt((notification) => {
        const detectionText = document.getElementById('google-detection-text');
        if (notification.isNotDisplayed()) {
          console.log('[GIS] One Tap not displayed:', notification.getNotDisplayedReason());
          if (detectionText) detectionText.innerHTML = `Google Account detection ready. Tap button to authenticate as <strong>${escapeHtml(googleAuthConfig.operatorEmail)}</strong>.`;
        } else if (notification.isDismissedMoment()) {
          console.log('[GIS] One Tap dismissed:', notification.getDismissedReason());
        }
      });
    } catch (err) {
      console.error('[GIS] Error initializing Google Identity:', err);
    }
  };

  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    startGis();
  } else {
    window.addEventListener('load', startGis);
    setTimeout(startGis, 1200);
  }
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) {
    alert('No Google credential returned.');
    return;
  }
  const detectionText = document.getElementById('google-detection-text');
  if (detectionText) {
    detectionText.innerHTML = `<span style="color: var(--color-cyan);">Verifying Google credentials with Google OAuth2 servers...</span>`;
  }
  try {
    const res = await fetch('/api/auth/google-pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    });
    const data = await res.json();
    if (data.success) {
      sound.success();
      setStoredToken(data.token, true);
      loginModal.classList.add('hidden');
      const badge = document.getElementById('operator-badge');
      if (badge && data.email) {
        const photo = data.picture ? `<img src="${escapeHtml(data.picture)}" style="width: 18px; height: 18px; border-radius: 50%; vertical-align: middle; margin-right: 4px;">` : '';
        badge.innerHTML = `<span class="dot-pulse green"></span>${photo}<span>OPERATOR: ${escapeHtml(data.email)} [GOOGLE PRO // VERIFIED]</span>`;
      }
      renderActiveDeck();
    } else {
      sound.error();
      if (detectionText) {
        detectionText.innerHTML = `<span style="color: #ef4444;">${escapeHtml(data.error || 'Unauthorized Google account.')}</span>`;
      }
      alert(data.error || 'Access Denied: Google verification failed.');
    }
  } catch (err) {
    sound.error();
    alert('Network error connecting to verification server.');
  }
}

// Verify session clearance and keep Google Pro mail permanently authenticated
async function checkClearance() {
  try {
    const existingToken = getStoredToken();
    const headers = {};
    if (existingToken) {
      headers['Authorization'] = `Bearer ${existingToken}`;
      headers['x-manisoft-token'] = existingToken;
    }

    const res = await fetch('/api/health', { headers });
    const health = await res.json();

    if (health.zeroTrustBypass || health.authenticated) {
      loginModal.classList.add('hidden');
      const badge = document.getElementById('operator-badge');
      if (badge && health.operatorEmail) {
        badge.innerHTML = `<span class="dot-pulse green"></span><span>OPERATOR: ${escapeHtml(health.operatorEmail)} [GOOGLE PRO // VERIFIED]</span>`;
      }
      return;
    }

    if (existingToken) {
      const vRes = await fetch('/api/auth/verify-session', { headers });
      const vData = await vRes.json();
      if (vData.valid) {
        if (vData.token) setStoredToken(vData.token, true);
        loginModal.classList.add('hidden');
        const badge = document.getElementById('operator-badge');
        if (badge && vData.email) {
          badge.innerHTML = `<span class="dot-pulse green"></span><span>OPERATOR: ${escapeHtml(vData.email)} [GOOGLE PRO // VERIFIED]</span>`;
        }
        return;
      }
    }

    loginModal.classList.remove('hidden');
  } catch (e) {
    loginModal.classList.remove('hidden');
  }
}

// Google Pro Trigger Button
const googleProBtn = document.getElementById('btn-google-pro-auth');
if (googleProBtn) {
  googleProBtn.addEventListener('click', async () => {
    sound.tap();
    if (googleAuthConfig.googleClientId && typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      // Trigger Google account selector prompt
      google.accounts.id.prompt();
    } else {
      // Prompt user to configure Google Client ID or use Pass-Seed
      const drawer = document.getElementById('google-config-drawer');
      if (drawer) drawer.classList.toggle('hidden');
      alert(`Google Identity Air-Lock: To enable automatic browser account detection for ${googleAuthConfig.operatorEmail}, set up your Google Cloud OAuth Client ID below, or authenticate using your Sovereign Master Pass-Seed.`);
    }
  });
}

// Setup Drawer Toggle & Save
const toggleGoogleConfig = document.getElementById('toggle-google-config');
const googleConfigDrawer = document.getElementById('google-config-drawer');
if (toggleGoogleConfig && googleConfigDrawer) {
  toggleGoogleConfig.addEventListener('click', (e) => {
    e.preventDefault();
    googleConfigDrawer.classList.toggle('hidden');
  });
}

const btnSaveGoogleConfig = document.getElementById('btn-save-google-config');
if (btnSaveGoogleConfig) {
  btnSaveGoogleConfig.addEventListener('click', async () => {
    const clientId = (document.getElementById('cfg-google-client-id').value || '').trim();
    const masterSecret = (document.getElementById('cfg-master-secret').value || '').trim();
    if (!clientId) {
      alert('Please enter a valid Google OAuth Client ID.');
      return;
    }
    try {
      const res = await fetch('/api/auth/google-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, master_secret: masterSecret })
      });
      const data = await res.json();
      if (data.success) {
        sound.success();
        alert('Google OAuth Client ID saved successfully! Initializing Google Identity Air-Lock...');
        googleConfigDrawer.classList.add('hidden');
        await initGoogleAuth();
      } else {
        sound.error();
        alert(data.error || 'Failed to save Google Client ID.');
      }
    } catch (e) {
      sound.error();
      alert('Network error saving Google configuration.');
    }
  });
}

// Master Secret / Pass-Seed Login Form
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('auth-password').value;
    const honeypot = document.getElementById('sys_master_key').value;
    const rememberMe = document.getElementById('remember-me') ? document.getElementById('remember-me').checked : true;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, sys_master_key: honeypot, rememberMe })
      });
      const data = await res.json();
      if (data.success) {
        sound.success();
        setStoredToken(data.token, rememberMe);
        loginModal.classList.add('hidden');
        const badge = document.getElementById('operator-badge');
        if (badge && data.email) {
          badge.innerHTML = `<span class="dot-pulse green"></span><span>OPERATOR: ${escapeHtml(data.email)} [GOOGLE PRO // VERIFIED]</span>`;
        }
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

// ------------------------------------------------------------------------------
// 2. MULTI-DECK NAVIGATION SWITCHER
// ------------------------------------------------------------------------------
window.toggleMobileDecks = function(forceState) {
  const sidebar = document.querySelector('.left-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  const shouldOpen = typeof forceState === 'boolean' ? forceState : !sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open', shouldOpen);
  if (backdrop) backdrop.classList.toggle('active', shouldOpen);
  if (sound && sound.tap) sound.tap();
};

function switchDeck(deckId) {
  activeDeck = deckId;
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.deck === deckId);
  });
  const sidebar = document.querySelector('.left-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('active');
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
let thinkingEnabled = true;
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
    // Populate model selector once (if still showing loading placeholder)
    const modelSelect = document.getElementById('comm-model-select');
    if (modelSelect && modelSelect.options.length === 1 && modelSelect.options[0].value === '') {
      fetch('/api/models')
        .then(r => r.json())
        .then(data => {
          if (!data.models || !data.models.length) return;
          modelSelect.innerHTML = '';
          // Group: non-deprecated first, then deprecated
          const active = data.models.filter(m => !m.deprecated);
          const deprecated = data.models.filter(m => m.deprecated);
          if (active.length) {
            const g1 = document.createElement('optgroup');
            g1.label = '── Active Models ──';
            active.forEach(m => {
              const opt = document.createElement('option');
              opt.value = m.name;
              opt.textContent = m.displayName || m.name;
              opt.title = m.description || '';
              g1.appendChild(opt);
            });
            modelSelect.appendChild(g1);
          }
          if (deprecated.length) {
            const g2 = document.createElement('optgroup');
            g2.label = '── Deprecated ──';
            deprecated.forEach(m => {
              const opt = document.createElement('option');
              opt.value = m.name;
              opt.textContent = `⚠ ${m.displayName || m.name}`;
              opt.title = m.description || '';
              g2.appendChild(opt);
            });
            modelSelect.appendChild(g2);
          }
          // Pre-select the current default
          const defaultModel = 'gemini-3.6-flash';
          for (const opt of modelSelect.options) {
            if (opt.value === defaultModel) { opt.selected = true; break; }
          }
        })
        .catch(() => {
          modelSelect.innerHTML = '<option value="">⚡ Default model</option>';
        });
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
  stream.appendChild(aiBubble);
  stream.scrollTop = stream.scrollHeight;

  const statusText = document.getElementById('comm-status-text');
  if (statusText) statusText.textContent = 'MANI AI is reasoning & executing...';

  const selectedModel = (document.getElementById('comm-model-select')?.value || '').trim() || null;
  const modelLabel = selectedModel || 'MANI AI';

  aiBubble.innerHTML = `<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-neon);">🤖 ${escapeHtml(modelLabel)}:</div><div class="thinking-text" style="color: var(--text-dim); font-style: italic;">Reasoning &amp; executing prompt...</div>`;

  try {
    const res = await fetch('/api/mani/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText, continue: true, showThinking: thinkingEnabled, model: selectedModel })
    });
    const data = await res.json();
    const reply = data.output || data.reply || data.error || 'No response produced.';
    const thought = data.thought || '';

    let thoughtHtml = '';
    if (thought && thinkingEnabled) {
      thoughtHtml = `
        <details class="comm-thought-box" open>
          <summary class="comm-thought-summary">
            <span>💭 Thinking Process</span>
            <span class="thought-badge">REASONING</span>
          </summary>
          <div class="comm-thought-body">${escapeHtml(thought)}</div>
        </details>
      `;
    }

    const isSlash = promptText.trim().startsWith('/') || promptText.trim().startsWith('agy ');
    const isCli = data.isCliCommand || isSlash;

    let contentHtml = '';
    if (isCli) {
      contentHtml = `<pre style="background: #000; border: 1px solid var(--border-dim); border-radius: 4px; padding: 10px; overflow-x: auto; color: var(--color-neon); font-family: var(--font-mono); font-size: 11px; white-space: pre-wrap; line-height: 1.4; margin: 4px 0 0 0;">${escapeHtml(reply)}</pre>`;
    } else {
      contentHtml = `<div>${escapeHtml(reply).replace(/\n/g, '<br>')}</div>`;
    }

    aiBubble.innerHTML = `${thoughtHtml}<div style="font-weight: bold; margin-bottom: 4px; color: var(--color-neon);">🤖 MANI AI:</div>${contentHtml}`;

    if (data.success !== false) {
      sound.success();
      if (!isCli) {
        speakManiResponse(reply);
      }
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
        ${isAgy ? `<button id="btn-term-thinking-toggle" class="btn-ghost-sm" title="Toggle thinking / reasoning process display">${thinkingEnabled ? '💭 THINKING: ON' : '💭 THINKING: OFF'}</button>` : ''}
        <button id="btn-voice-toggle" class="btn-ghost-sm" title="Toggle audio spoken response">${voiceReplyEnabled ? '🔊 VOICE: ON' : '🔈 VOICE: OFF'}</button>
      </div>
    </div>
    <div class="terminal-deck">
      <div class="terminal-header">
        <span>${isAgy ? 'SOVEREIGN AGENT // MANI AI Autonomous Fleet Engine' : 'SOVEREIGN PTY STREAM // /bin/bash'}</span>
        <span>${isAgy ? 'CAPABILITIES: Edit Projects, Full Read/Write, Git, Shell' : 'HOTSTRINGS: ;;audit, ;;push'}</span>
      </div>
      <div id="term-out" class="terminal-output">manisoft@sovereign:~$ Mani$oft Mission Control Ready.\n${isAgy ? '[MANI AI] Sovereign agent connected at ~/MANISOFT/projects. Full CLI & slash commands active (/usage, /models, /model, /help). Speak via MIC or type instructions.\n' : '[BASH] Local shell active. Full CLI available.\n'}</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
        <button class="pill pill-green term-chip" data-cmd="/usage" style="border-color: var(--color-neon); cursor: pointer;">📊 /usage</button>
        <button class="pill pill-green term-chip" data-cmd="/models" style="border-color: var(--color-neon); cursor: pointer;">🤖 /models</button>
        <button class="pill pill-green term-chip" data-cmd="/model" style="border-color: var(--color-neon); cursor: pointer;">🔍 /model</button>
        <button class="pill pill-green term-chip" data-cmd="/help" style="border-color: var(--color-neon); cursor: pointer;">❓ /help</button>
        <button class="pill pill-green term-chip" data-cmd="/skills" style="border-color: var(--color-neon); cursor: pointer;">⚡ /skills</button>
        <button class="pill pill-cyan term-chip" data-cmd="agy models" style="cursor: pointer;">💻 agy models</button>
        <button class="pill pill-cyan term-chip" data-cmd="git status -s" style="cursor: pointer;">🐙 git status</button>
      </div>
      <div class="terminal-input-row">
        <input type="text" id="term-input" placeholder="${isAgy ? 'Type slash command (/usage, /models), agy command, or natural language...' : 'Type shell command or slash action (/usage, /models, agy models)...'}" autofocus>
        <button id="btn-term-send" class="btn-primary-sm">SEND</button>
      </div>
    </div>
  `;

  const termInput = containerEl.querySelector('#term-input');
  const termOut = containerEl.querySelector('#term-out');
  const termSend = containerEl.querySelector('#btn-term-send');
  const modeToggle = containerEl.querySelector('#term-mode-toggle');
  const voiceToggle = containerEl.querySelector('#btn-voice-toggle');
  const termThinkingToggle = containerEl.querySelector('#btn-term-thinking-toggle');

  if (termThinkingToggle) {
    termThinkingToggle.addEventListener('click', () => {
      sound.tap();
      thinkingEnabled = !thinkingEnabled;
      termThinkingToggle.textContent = thinkingEnabled ? '💭 THINKING: ON' : '💭 THINKING: OFF';
      const btnComm = document.getElementById('btn-comm-thinking-toggle');
      if (btnComm) btnComm.textContent = thinkingEnabled ? '💭 THINKING: ON' : '💭 THINKING: OFF';
    });
  }

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

    const isSlash = sanitized.startsWith('/');
    const isAgyDirect = sanitized.startsWith('agy ') || sanitized === 'agy';
    const isBashShell = terminalMode === 'bash';

    const promptPrefix = isBashShell ? 'manisoft@sovereign:~$ ' : 'operator@mani-ai:~$ ';
    termOut.textContent += `\n${promptPrefix}${sanitized}\n`;
    termInput.value = '';

    termOut.textContent += `[EXECUTING CLI COMMAND...]\n`;
    termOut.scrollTop = termOut.scrollHeight;

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'dispatch_terminal_command',
          params: {
            command: sanitized,
            mode: terminalMode,
            showThinking: thinkingEnabled
          }
        })
      });
      const data = await res.json();
      termOut.textContent = termOut.textContent.replace(`[EXECUTING CLI COMMAND...]\n`, '');

      const result = data.result || {};
      if (result.thought && thinkingEnabled) {
        termOut.textContent += `[THINKING PROCESS]\n${result.thought}\n[/THINKING PROCESS]\n\n`;
      }
      if (result.output) {
        if (result.isCliCommand || isSlash || isAgyDirect) {
          termOut.textContent += `${result.output}\n`;
        } else {
          termOut.textContent += `🤖 MANI AI:\n${result.output}\n\n`;
          speakManiResponse(result.output);
        }
      } else if (result.error) {
        termOut.textContent += `[-] Error: ${result.error}\n`;
      }
    } catch (err) {
      termOut.textContent = termOut.textContent.replace(`[EXECUTING CLI COMMAND...]\n`, '');
      termOut.textContent += `[-] Dispatch failed: ${err.message}\n`;
    }
    termOut.scrollTop = termOut.scrollHeight;
  };

  containerEl.querySelectorAll('.term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sound.tap();
      const cmd = chip.dataset.cmd;
      if (cmd && termInput) {
        termInput.value = cmd;
        executeCmd();
      }
    });
  });

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

const btnCommThinkingToggle = document.getElementById('btn-comm-thinking-toggle');
if (btnCommThinkingToggle) {
  btnCommThinkingToggle.addEventListener('click', () => {
    sound.tap();
    thinkingEnabled = !thinkingEnabled;
    btnCommThinkingToggle.textContent = thinkingEnabled ? '💭 THINKING: ON' : '💭 THINKING: OFF';
    const btnTerm = document.getElementById('btn-term-thinking-toggle');
    if (btnTerm) btnTerm.textContent = thinkingEnabled ? '💭 THINKING: ON' : '💭 THINKING: OFF';
  });
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
initGoogleAuth();
renderActiveDeck();
pollTelemetry();

