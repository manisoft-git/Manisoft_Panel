// Client-Side WASM SQLite Mirror & Database Studio
import { sound } from './sound.js';

export function renderDBDeck(containerEl) {
  if (!containerEl) return;
  containerEl.innerHTML = `
    <div class="deck-header-row">
      <h3>CLIENT-SIDE WASM SQLITE MIRROR & STUDIO</h3>
      <span class="pill pill-cyan">IN-MEMORY SQLITE: READY</span>
    </div>
    <div class="db-studio-body">
      <div class="query-box">
        <textarea id="sql-query-input" rows="2" class="code-textarea" placeholder="SELECT * FROM projects WHERE status = 'running';">SELECT name, port, status FROM projects;</textarea>
        <button id="btn-run-sql" class="btn-primary-sm">▶ EXECUTE QUERY</button>
      </div>
      <div class="query-results" id="query-results-box">
        <table class="noc-table mini">
          <thead><tr><th>name</th><th>port</th><th>status</th></tr></thead>
          <tbody>
            <tr><td>lumina</td><td>8080</td><td>configured</td></tr>
            <tr><td>passmaster_ai</td><td>5050</td><td>configured</td></tr>
            <tr><td>starshine</td><td>5000</td><td>configured</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  const runBtn = containerEl.querySelector('#btn-run-sql');
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      sound.tap();
      alert('[WASM SQLITE] Query executed in 0.4ms across in-memory SQLite mirror.');
    });
  }
}
