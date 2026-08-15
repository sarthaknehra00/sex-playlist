/**
 * ==========================================================================
 * LUMINA LOUNGE — ATMOSPHERIC AMBIENCE SOUNDSCAPE MIXER
 * ==========================================================================
 */

export class AmbienceMixer {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.layers = {
      rain: { active: false, volume: 0.4, node: null, gain: null },
      breeze: { active: false, volume: 0.35, node: null, gain: null },
      fire: { active: false, volume: 0.4, node: null, gain: null },
      vinyl: { active: true, volume: 0.3, node: null, gain: null }
    };
  }

  initLayer(layerKey) {
    if (!this.audioEngine.audioCtx) {
      this.audioEngine.initAudio();
    }
    const ctx = this.audioEngine.audioCtx;
    const layer = this.layers[layerKey];

    if (layer.node) return; // already created

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (layerKey === 'rain') {
        // Rain: constant hiss + droplet bursts
        const rainNoise = (Math.random() * 2 - 1) * 0.08;
        const drop = Math.random() > 0.999 ? (Math.random() * 0.5) : 0;
        data[i] = rainNoise + drop;
      } else if (layerKey === 'breeze') {
        // Soft pink noise
        data[i] = (Math.random() * 2 - 1) * 0.05;
      } else if (layerKey === 'fire') {
        // Low rumble + occasional loud snap
        const rumble = (Math.random() * 2 - 1) * 0.04;
        const snap = Math.random() > 0.9992 ? (Math.random() * 0.7 - 0.35) : 0;
        data[i] = rumble + snap;
      } else if (layerKey === 'vinyl') {
        // Classic vinyl hiss & crackle
        const hiss = (Math.random() * 2 - 1) * 0.02;
        const crackle = Math.random() > 0.998 ? (Math.random() * 0.3 - 0.15) : 0;
        data[i] = hiss + crackle;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    if (layerKey === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, ctx.currentTime);
    } else if (layerKey === 'breeze') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
    } else if (layerKey === 'fire') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
    }

    const gainNode = ctx.createGain();
    const targetVol = layer.active ? layer.volume : 0;
    gainNode.gain.setValueAtTime(targetVol, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioEngine.masterGain);
    source.start();

    layer.node = source;
    layer.gain = gainNode;
  }

  toggleLayer(layerKey) {
    const layer = this.layers[layerKey];
    if (!layer) return false;

    layer.active = !layer.active;
    this.initLayer(layerKey);

    if (layer.gain && this.audioEngine.audioCtx) {
      const target = layer.active ? layer.volume : 0;
      layer.gain.gain.setTargetAtTime(target, this.audioEngine.audioCtx.currentTime, 0.05);
    }

    return layer.active;
  }

  setLayerVolume(layerKey, volume) {
    const layer = this.layers[layerKey];
    if (!layer) return;

    layer.volume = Math.max(0, Math.min(1, volume));
    if (layer.active && layer.gain && this.audioEngine.audioCtx) {
      layer.gain.gain.setTargetAtTime(layer.volume, this.audioEngine.audioCtx.currentTime, 0.05);
    }
  }

  getLayerState(layerKey) {
    return this.layers[layerKey] ? this.layers[layerKey].active : false;
  }
}
