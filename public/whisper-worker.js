// Offline WebGPU Whisper Dictation Worker Fallback
self.onmessage = function(e) {
  const { type, audioBuffer } = e.data;
  if (type === 'TRANSCRIBE') {
    // Simulated fast on-device whisper speech-to-text token output
    self.postMessage({
      type: 'TRANSCRIPTION_RESULT',
      text: '[VOICE_INPUT_READY] Running local model inference...'
    });
  }
};
