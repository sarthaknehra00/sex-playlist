/**
 * ==========================================================================
 * LUMINA LOUNGE — PROCEDURAL WEB AUDIO SYNTHESIZER & TRACK ENGINE
 * ==========================================================================
 */

export class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.85;
    this.currentTime = 0;
    this.duration = 248; // default 4:08 in seconds
    this.isLooping = false;
    this.isShuffling = false;
    this.currentTrackIndex = 0;

    // Synthesizer State
    this.timerId = null;
    this.stepIndex = 0;
    this.synthGain = null;
    this.vinylNode = null;
    this.vinylGain = null;

    // Playlist Data
    this.playlist = [
      {
        id: 'track-1',
        title: 'Nocturne No. 1 — Velvet Rain',
        artist: 'Lumina Ensemble',
        durationSec: 248,
        mood: 'Velvet Lounge',
        bpm: 68,
        chords: [
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 349.23], // G7
          [164.81, 207.65, 246.94, 311.13]  // E7b9
        ],
        bass: [55.00, 43.65, 49.00, 41.20]
      },
      {
        id: 'track-2',
        title: 'Midnight Silk — Sensual Pulse',
        artist: 'Aethel & The Wave',
        durationSec: 225,
        mood: 'Deep Lo-Fi',
        bpm: 72,
        chords: [
          [246.94, 293.66, 369.99, 440.00], // Bm7
          [196.00, 246.94, 293.66, 369.99], // Gmaj7
          [220.00, 277.18, 329.63, 392.00], // A7
          [185.00, 233.08, 277.18, 349.23]  // F#7
        ],
        bass: [61.74, 49.00, 55.00, 46.25]
      },
      {
        id: 'track-3',
        title: 'Amber Embers — After Hours',
        artist: 'Saffron Dream',
        durationSec: 272,
        mood: 'Chillout Chords',
        bpm: 65,
        chords: [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 392.00]  // G6
        ],
        bass: [65.41, 55.00, 43.65, 49.00]
      },
      {
        id: 'track-4',
        title: 'Neon Reverie — Slow Burn',
        artist: 'Indigo Shade',
        durationSec: 310,
        mood: 'Ambient Rhythms',
        bpm: 70,
        chords: [
          [293.66, 349.23, 440.00, 523.25], // Dm7
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [196.00, 246.94, 293.66, 349.23]  // G7
        ],
        bass: [73.42, 65.41, 55.00, 49.00]
      },
      {
        id: 'track-5',
        title: 'Silk & Smoke — 4K Intimacy',
        artist: 'Celeste Nova',
        durationSec: 236,
        mood: 'Late Night Soul',
        bpm: 64,
        chords: [
          [207.65, 261.63, 311.13, 392.00], // Abmaj7
          [174.61, 207.65, 261.63, 311.13], // Fm7
          [233.08, 277.18, 349.23, 415.30], // Bbm7
          [196.00, 246.94, 293.66, 349.23]  // Eb7
        ],
        bass: [51.91, 43.65, 58.27, 49.00]
      },
      {
        id: 'track-6',
        title: 'Lumina Horizon — Dawn Echoes',
        artist: 'Nocturne Sound Lab',
        durationSec: 280,
        mood: 'Binaural Glow',
        bpm: 60,
        chords: [
          [196.00, 246.94, 293.66, 392.00], // Gmaj7
          [220.00, 261.63, 329.63, 392.00], // Am7
          [246.94, 293.66, 369.99, 440.00], // Bm7
          [261.63, 329.63, 392.00, 493.88]  // Cmaj7
        ],
        bass: [49.00, 55.00, 61.74, 65.41]
      }
    ];

    // Callbacks
    this.onTrackChange = null;
    this.onStateChange = null;
    this.onTimeUpdate = null;
  }

  initAudio() {
    if (this.audioCtx) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

    // Analyser Node for Visualizer
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    // Connect Chain
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // Synth Sub-Mixer
    this.synthGain = this.audioCtx.createGain();
    this.synthGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
    this.synthGain.connect(this.masterGain);

    // Vinyl Noise Generator
    this.initVinylNoise();
  }

  initVinylNoise() {
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Pink/Brownian noise with occasional vinyl crackle pops
      const white = Math.random() * 2 - 1;
      const pop = Math.random() > 0.9995 ? (Math.random() * 0.4 - 0.2) : 0;
      output[i] = (white * 0.015) + pop;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.audioCtx.currentTime);

    this.vinylGain = this.audioCtx.createGain();
    this.vinylGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.vinylGain);
    this.vinylGain.connect(this.masterGain);
    whiteNoise.start();
  }

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex];
  }

  togglePlay() {
    if (!this.audioCtx) {
      this.initAudio();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.startSynthesizerLoop();
    } else {
      this.stopSynthesizerLoop();
    }

    if (this.onStateChange) {
      this.onStateChange(this.isPlaying);
    }
  }

  startSynthesizerLoop() {
    if (this.timerId) clearInterval(this.timerId);
    
    const track = this.getCurrentTrack();
    const beatInterval = (60 / track.bpm) * 1000; // ms per beat

    // Play initial chord immediately
    this.playStep(this.stepIndex % 4);

    this.timerId = setInterval(() => {
      this.stepIndex++;
      this.currentTime += (beatInterval / 1000);

      // Trigger chord progression and rhythmic notes
      this.playStep(this.stepIndex % 4);

      if (this.currentTime >= track.durationSec) {
        if (this.isLooping) {
          this.currentTime = 0;
        } else {
          this.nextTrack();
          return;
        }
      }

      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.currentTime, track.durationSec);
      }
    }, beatInterval);
  }

  stopSynthesizerLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  playStep(chordIdx) {
    if (!this.audioCtx || !this.isPlaying) return;

    const track = this.getCurrentTrack();
    const chordFrequencies = track.chords[chordIdx] || track.chords[0];
    const bassFreq = track.bass[chordIdx] || track.bass[0];
    const now = this.audioCtx.currentTime;

    // 1. Play Soft Rhodes / E-Piano Chord
    chordFrequencies.forEach((freq, i) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Lowpass Filter for warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + (Math.sin(this.stepIndex) * 200), now);
      filter.Q.setValueAtTime(2, now);

      // Envelope: Soft attack, long lush decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08 / chordFrequencies.length, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.synthGain);

      osc.start(now);
      osc.stop(now + 2.4);
    });

    // 2. Play Sub-Bass Note
    const bassOsc = this.audioCtx.createOscillator();
    const bassGain = this.audioCtx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassGain.gain.setValueAtTime(0.0001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    bassOsc.connect(bassGain);
    bassGain.connect(this.synthGain);
    bassOsc.start(now);
    bassOsc.stop(now + 2.0);

    // 3. Ambient Lounge Shimmer Perk (Soft Hat / Rim)
    if (this.stepIndex % 2 === 1) {
      this.playSoftPerk(now);
    }
  }

  playSoftPerk(now) {
    const perkOsc = this.audioCtx.createOscillator();
    const perkGain = this.audioCtx.createGain();
    const perkFilter = this.audioCtx.createBiquadFilter();

    perkOsc.type = 'triangle';
    perkOsc.frequency.setValueAtTime(1200, now);
    perkFilter.type = 'bandpass';
    perkFilter.frequency.setValueAtTime(4500, now);

    perkGain.gain.setValueAtTime(0.0001, now);
    perkGain.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
    perkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    perkOsc.connect(perkFilter);
    perkFilter.connect(perkGain);
    perkGain.connect(this.synthGain);

    perkOsc.start(now);
    perkOsc.stop(now + 0.15);
  }

  seek(percent) {
    const track = this.getCurrentTrack();
    this.currentTime = Math.max(0, Math.min(track.durationSec, percent * track.durationSec));
    this.stepIndex = Math.floor(this.currentTime / ((60 / track.bpm)));

    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime, track.durationSec);
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioCtx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(target, this.audioCtx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  nextTrack() {
    if (this.isShuffling) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * this.playlist.length);
      } while (nextIdx === this.currentTrackIndex && this.playlist.length > 1);
      this.currentTrackIndex = nextIdx;
    } else {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    }
    
    this.loadCurrentTrack();
  }

  prevTrack() {
    if (this.currentTime > 4) {
      this.seek(0);
      return;
    }
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrentTrack();
  }

  selectTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentTrackIndex = index;
      this.loadCurrentTrack();
    }
  }

  loadCurrentTrack() {
    this.currentTime = 0;
    this.stepIndex = 0;
    const track = this.getCurrentTrack();
    this.duration = track.durationSec;

    if (this.onTrackChange) {
      this.onTrackChange(track, this.currentTrackIndex);
    }
    if (this.onTimeUpdate) {
      this.onTimeUpdate(0, track.durationSec);
    }

    if (this.isPlaying) {
      this.startSynthesizerLoop();
    }
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    return this.isLooping;
  }

  toggleShuffle() {
    this.isShuffling = !this.isShuffling;
    return this.isShuffling;
  }
}
