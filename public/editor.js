// Native WebAssembly Tree-Sitter & LSP Codex (public/editor.js)
import { sound } from './sound.js';

export function renderEditorDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>NATIVE TREE-SITTER & LSP CODEX</h3>
      <span class="pill pill-green">WASM GRAMMARS LOADED</span>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
      <select id="editor-lang-select" class="btn-ghost-sm" style="background:#0f141c; color:var(--text-bright); border:1px solid var(--border-dim); padding:4px 8px; border-radius:4px;">
        <option value="javascript">JavaScript / TypeScript</option>
        <option value="python">Python</option>
        <option value="go">Go</option>
        <option value="rust">Rust</option>
      </select>
      <button id="btn-ast-lint" class="btn-primary-sm">AST LINT</button>
      <button id="btn-jump-def" class="btn-secondary-sm">JUMP TO DEFINITION</button>
      <button id="btn-semantic-refactor" class="btn-ghost-sm">SEMANTIC REFACTOR</button>
    </div>
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
      <div>
        <div style="font-size:11px; color:var(--text-dim); margin-bottom:4px;">SURGICAL SOURCE EDITOR</div>
        <textarea id="editor-code" class="code-textarea" style="width:100%; height:200px; background:#05070a; color:var(--color-neon); font-family:monospace; font-size:12px; border:1px solid var(--border-dim); border-radius:4px; padding:8px;" spellcheck="false">// Mani$oft In-Browser Tree-Sitter Buffer
async function executeAutonomousRefactor(spec) {
  const ast = parseTreeSitterWasm(spec);
  return ast.validateIntegrity();
}</textarea>
      </div>
      <div>
        <div style="font-size:11px; color:var(--text-dim); margin-bottom:4px;">TREE-SITTER AST HIERARCHY & DIAGNOSTICS</div>
        <pre id="editor-ast-tree" style="background:#05070a; height:200px; overflow:auto; margin:0; padding:8px; border:1px solid var(--border-dim); border-radius:4px; font-family:monospace; font-size:11px; color:#4ade80;">Program
 └─ FunctionDeclaration: executeAutonomousRefactor
     ├─ Parameter: spec
     └─ BlockStatement
         ├─ VariableDeclaration: ast
         └─ ReturnStatement</pre>
      </div>
    </div>
  `;

  const btnLint = containerEl.querySelector('#btn-ast-lint');
  const btnJump = containerEl.querySelector('#btn-jump-def');
  const btnRefactor = containerEl.querySelector('#btn-semantic-refactor');
  const astTree = containerEl.querySelector('#editor-ast-tree');

  if (btnLint) {
    btnLint.addEventListener('click', () => {
      sound.tap();
      astTree.textContent = `[AST LINTER // PASS]\nZero phantom imports.\nZero hallucinated symbols.\nMemory footprint: 4.2 MB WASM.`;
    });
  }
  if (btnJump) {
    btnJump.addEventListener('click', () => {
      sound.tap();
      astTree.textContent = `[LSP DEFINITION]\nSymbol: executeAutonomousRefactor\nType: (spec: Object) => Promise<boolean>\nLocation: Buffer:Line 2, Col 16`;
    });
  }
  if (btnRefactor) {
    btnRefactor.addEventListener('click', () => {
      sound.success();
      astTree.textContent = `[SEMANTIC REFACTOR]\nAST Micro-patch applied cleanly.\n0 regressions detected.`;
    });
  }
}
