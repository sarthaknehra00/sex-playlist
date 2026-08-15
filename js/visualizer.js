/**
 * ==========================================================================
 * LUMINA LOUNGE — 4K AUDIO-REACTIVE CANVAS VISUALIZER
 * ==========================================================================
 */

export class AudioVisualizer {
  constructor(canvasElement, audioEngine) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.audioEngine = audioEngine;
    this.mode = 'silk-waves'; // 'silk-waves' | 'nebula-glow' | 'stardust-pulse'
    this.animationId = null;
    this.particles = [];
    this.phase = 0;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
    this.initParticles(80);
    this.startRender();
  }

  initCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseAlpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  startRender() {
    const render = () => {
      this.draw();
      this.animationId = requestAnimationFrame(render);
    };
    render();
  }

  getAudioData() {
    if (!this.audioEngine || !this.audioEngine.analyser) {
      return {
        freqData: new Uint8Array(128).fill(10),
        timeData: new Uint8Array(128).fill(128),
        avgVolume: 0.15
      };
    }

    const bufferLength = this.audioEngine.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);

    this.audioEngine.analyser.getByteFrequencyData(freqData);
    this.audioEngine.analyser.getByteTimeDomainData(timeData);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += freqData[i];
    }
    const avgVolume = this.audioEngine.isPlaying ? (sum / bufferLength) / 255 : 0.05;

    return { freqData, timeData, avgVolume };
  }

  getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue('--primary').trim() || '#ffb59a',
      primaryGlow: style.getPropertyValue('--primary-glow').trim() || 'rgba(255, 181, 154, 0.4)',
      secondary: style.getPropertyValue('--secondary').trim() || '#ffb94c',
      tertiary: style.getPropertyValue('--tertiary').trim() || '#aac8f9'
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const { freqData, timeData, avgVolume } = this.getAudioData();
    const colors = this.getThemeColors();
    this.phase += 0.015 + (avgVolume * 0.04);

    if (this.mode === 'silk-waves') {
      this.drawSilkWaves(timeData, freqData, avgVolume, colors);
    } else if (this.mode === 'nebula-glow') {
      this.drawNebulaGlow(freqData, avgVolume, colors);
    } else if (this.mode === 'stardust-pulse') {
      this.drawStardustPulse(freqData, avgVolume, colors);
    }

    this.drawFloatingParticles(avgVolume, colors);
  }

  drawSilkWaves(timeData, freqData, avgVolume, colors) {
    const ctx = this.ctx;
    const centerY = this.height * 0.58;
    const waveCount = 3;

    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const waveAlpha = (0.2 + (w * 0.15)) * (this.audioEngine.isPlaying ? 1 : 0.6);
      const gradient = ctx.createLinearGradient(0, centerY - 150, this.width, centerY + 150);
      
      if (w === 0) {
        gradient.addColorStop(0, colors.primary);
        gradient.addColorStop(0.5, colors.secondary);
        gradient.addColorStop(1, colors.tertiary);
      } else if (w === 1) {
        gradient.addColorStop(0, colors.secondary);
        gradient.addColorStop(0.5, colors.primary);
        gradient.addColorStop(1, colors.secondary);
      } else {
        gradient.addColorStop(0, colors.tertiary);
        gradient.addColorStop(0.5, colors.secondary);
        gradient.addColorStop(1, colors.primary);
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5 - (w * 0.5);
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 15 * (avgVolume + 0.3);

      const sliceWidth = this.width / 60;
      let x = 0;

      for (let i = 0; i <= 60; i++) {
        const dataIdx = Math.floor((i / 60) * timeData.length);
        const timeVal = (timeData[dataIdx] - 128) / 128;
        const freqVal = (freqData[dataIdx % freqData.length] / 255);

        const sinWave = Math.sin((i * 0.1) + this.phase + (w * 1.2)) * (40 + (w * 25));
        const audioRipple = timeVal * 90 * (avgVolume + 0.4);
        const y = centerY + sinWave + audioRipple;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // Reset
    }
  }

  drawNebulaGlow(freqData, avgVolume, colors) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const bass = (freqData[2] || 0) / 255;
    const mid = (freqData[16] || 0) / 255;

    // Glowing Radial Aura
    const auraRadius = Math.min(this.width, this.height) * (0.28 + (bass * 0.12));
    const auraGrad = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, auraRadius
    );
    auraGrad.addColorStop(0, colors.primaryGlow);
    auraGrad.addColorStop(0.4, 'rgba(212, 120, 85, 0.15)');
    auraGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Rhythm Rings
    for (let r = 1; r <= 4; r++) {
      ctx.beginPath();
      const ringRadius = auraRadius * (0.3 + (r * 0.22)) + (Math.sin(this.phase * 2 + r) * 12);
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = r % 2 === 0 ? colors.primary : colors.secondary;
      ctx.globalAlpha = 0.25 + (mid * 0.4);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  drawStardustPulse(freqData, avgVolume, colors) {
    const ctx = this.ctx;
    const centerX = this.width / 2;
    const centerY = this.height * 0.52;
    const count = 48;
    const baseRadius = 140 + (avgVolume * 80);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (this.phase * 0.5);
      const dataVal = (freqData[i % freqData.length] / 255) || 0.1;
      const r = baseRadius + (dataVal * 90);
      const px = centerX + Math.cos(angle) * r;
      const py = centerY + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(px, py, 2.5 + (dataVal * 4), 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? colors.primary : colors.secondary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 12 * dataVal;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connecting subtle lines
      if (i > 0 && i % 3 === 0) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = colors.primary;
        ctx.globalAlpha = 0.08 + (dataVal * 0.15);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }
  }

  drawFloatingParticles(avgVolume, colors) {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      p.x += p.vx * (1 + avgVolume * 1.5);
      p.y += p.vy * (1 + avgVolume * 1.5);

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const alpha = p.baseAlpha + Math.sin(this.phase + p.phase) * 0.2 + (avgVolume * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 + avgVolume * 0.8), 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.globalAlpha = Math.max(0.1, Math.min(0.85, alpha));
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
