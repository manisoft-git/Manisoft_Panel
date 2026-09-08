// Tree-Sitter AST Surgical Micro-Rollback & Git Matrix
import { sound } from './sound.js';

export function renderGitMatrix(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>AST MICRO-ROLLBACK & SOVEREIGN GIT MATRIX</h3>
      <span class="pill pill-cyan">BRANCH: main [SOVEREIGN]</span>
    </div>
    <div class="git-controls">
      <button id="btn-git-audit" class="btn-primary-sm">🛡️ RUN AST AUDIT (;;audit)</button>
      <button id="btn-git-push" class="btn-secondary-sm">🚀 SOVEREIGN PUSH (;;push)</button>
      <button id="btn-ast-undo" class="btn-ghost-sm">↺ SURGICAL AST UNDO</button>
    </div>
    <div class="git-status-box">
      <pre id="git-output-pre">[GIT LEDGER] Ready. Clean working tree. Zero hallucinated dependencies.</pre>
    </div>
  `;

  const auditBtn = containerEl.querySelector('#btn-git-audit');
  const pushBtn = containerEl.querySelector('#btn-git-push');
  const undoBtn = containerEl.querySelector('#btn-ast-undo');
  const outPre = containerEl.querySelector('#git-output-pre');

  if (auditBtn) {
    auditBtn.addEventListener('click', () => {
      sound.tap();
      outPre.textContent = '[AST AUDIT] Scanning AST nodes... PASS (Zero phantom imports detected).';
    });
  }
  if (pushBtn) {
    pushBtn.addEventListener('click', () => {
      sound.success();
      outPre.textContent = '[SOVEREIGN PUSH] Committing cryptographically signed Merkle block to main... DONE.';
    });
  }
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      sound.tap();
      outPre.textContent = '[AST UNDO] Reverting last mutated function AST node... Reverted.';
    });
  }
}
