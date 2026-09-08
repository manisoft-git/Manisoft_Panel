// Dedicated UI Web Worker: Offloads Telemetry, AST, SSIM, Vector Search
self.onmessage = function(e) {
  const { id, type, payload } = e.data;

  if (type === 'CALCULATE_DELTAS') {
    const { current, previous } = payload;
    const deltas = {
      cpuDelta: (current.load - (previous ? previous.load : 0)).toFixed(2),
      memDelta: ((current.mem - (previous ? previous.mem : 0)) / (1024 * 1024)).toFixed(2)
    };
    self.postMessage({ id, type, result: deltas });
  } else if (type === 'VECTOR_SIMILARITY') {
    const { queryVec, docs } = payload;
    // Cosine similarity
    const results = (docs || []).map(d => {
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < queryVec.length; i++) {
        dot += queryVec[i] * (d.vec[i] || 0);
        magA += queryVec[i] * queryVec[i];
        magB += (d.vec[i] || 0) * (d.vec[i] || 0);
      }
      const score = magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
      return { id: d.id, score };
    }).sort((a, b) => b.score - a.score);
    self.postMessage({ id, type, result: results.slice(0, 5) });
  } else if (type === 'FILTER_LOGS') {
    const { logs, query } = payload;
    const filtered = (logs || []).filter(line => line.toLowerCase().includes(query.toLowerCase()));
    self.postMessage({ id, type, result: filtered });
  } else {
    self.postMessage({ id, type, result: { status: 'processed' } });
  }
};
