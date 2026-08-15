/**
 * ==========================================================================
 * LUMINA LOUNGE — MAIN APPLICATION CONTROLLER
 * ==========================================================================
 */

import { AudioEngine } from './audioEngine.js';
import { AudioVisualizer } from './visualizer.js';
import { AmbienceMixer } from './ambience.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Engines
  const audioEngine = new AudioEngine();
  const canvas = document.getElementById('visualizer-canvas');
  const visualizer = new AudioVisualizer(canvas, audioEngine);
  const ambience = new AmbienceMixer(audioEngine);

  // 2. DOM Elements Selection
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlayPause = document.getElementById('icon-play-pause');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnLoop = document.getElementById('btn-loop');
  const btnShuffle = document.getElementById('btn-shuffle');
  const btnMute = document.getElementById('btn-mute');
  const iconVolume = document.getElementById('icon-volume');

  // Hero Display
  const heroDisplayTitle = document.getElementById('hero-display-title');
  const heroSubtitle = document.getElementById('hero-subtitle');
  const trackTagPill = document.getElementById('track-tag-pill');
  const pulseBars = document.querySelectorAll('.pulse-bar');

  // Player Dock Elements
  const trackTitleEl = document.getElementById('player-track-title');
  const trackArtistEl = document.getElementById('player-track-artist');
  const timeCurrentEl = document.getElementById('time-current');
  const timeTotalEl = document.getElementById('time-total');
  const scrubberTrack = document.getElementById('scrubber-track');
  const scrubberFill = document.getElementById('scrubber-fill');
  const scrubberThumb = document.getElementById('scrubber-thumb');
  const volumeTrack = document.getElementById('volume-track');
  const volumeFill = document.getElementById('volume-fill');

  // Modals & Drawers
  const btnQueue = document.getElementById('btn-queue');
  const queueDrawer = document.getElementById('queue-drawer');
  const btnCloseQueue = document.getElementById('btn-close-queue');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const tracklistContainer = document.getElementById('tracklist-container');

  const btnAmbience = document.getElementById('btn-ambience');
  const ambienceModal = document.getElementById('ambience-modal');
  const btnCloseAmbience = document.getElementById('btn-close-ambience');

  const btnTheme = document.getElementById('btn-theme');
  const themeModal = document.getElementById('theme-modal');
  const btnCloseTheme = document.getElementById('btn-close-theme');
  const themeBtns = document.querySelectorAll('.theme-pill-btn');

  const btnVisualizerMode = document.getElementById('btn-vis-mode');
  const visModeText = document.getElementById('vis-mode-text');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Inactivity Zen Mode
  let inactivityTimer = null;
  const resetInactivityTimer = () => {
    document.body.classList.remove('zen-mode');
    clearTimeout(inactivityTimer);
    if (audioEngine.isPlaying) {
      inactivityTimer = setTimeout(() => {
        document.body.classList.add('zen-mode');
      }, 7000);
    }
  };

  window.addEventListener('mousemove', resetInactivityTimer);
  window.addEventListener('keydown', resetInactivityTimer);
  window.addEventListener('click', resetInactivityTimer);

  // 3. Populate Playlist Queue
  const renderQueue = () => {
    tracklistContainer.innerHTML = '';
    audioEngine.playlist.forEach((track, index) => {
      const item = document.createElement('div');
      item.className = `tracklist-item ${index === audioEngine.currentTrackIndex ? 'active' : ''}`;
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="label-sm opacity-60 w-4">${(index + 1).toString().padStart(2, '0')}</span>
          <div>
            <div class="track-title text-sm">${track.title}</div>
            <div class="track-artist text-xs">${track.artist} • ${track.mood}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="label-sm opacity-70">${formatTime(track.durationSec)}</span>
          ${index === audioEngine.currentTrackIndex && audioEngine.isPlaying ? '<span class="material-symbols-outlined text-primary text-sm animate-spin">graphic_eq</span>' : ''}
        </div>
      `;
      item.addEventListener('click', () => {
        audioEngine.selectTrack(index);
        if (!audioEngine.isPlaying) audioEngine.togglePlay();
        renderQueue();
      });
      tracklistContainer.appendChild(item);
    });
  };

  // Helper: Format Seconds to M:SS
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  // 4. Update UI on Track Change
  const updateTrackUI = (track) => {
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist;
    trackTagPill.innerHTML = `<span class="material-symbols-outlined text-xs">radio</span> ${track.mood} • ${track.bpm} BPM`;
    timeTotalEl.textContent = formatTime(track.durationSec);
    timeCurrentEl.textContent = '0:00';
    scrubberFill.style.width = '0%';
    scrubberThumb.style.left = '0%';
    renderQueue();
  };

  // 5. Wire Audio Engine Callbacks
  audioEngine.onTrackChange = (track) => {
    updateTrackUI(track);
  };

  audioEngine.onStateChange = (isPlaying) => {
    iconPlayPause.textContent = isPlaying ? 'pause' : 'play_arrow';
    btnPlayPause.classList.toggle('box-glow', isPlaying);
    resetInactivityTimer();
    renderQueue();

    // Pulse bar animation sync
    pulseBars.forEach((bar, i) => {
      if (isPlaying) {
        bar.style.height = `${12 + (i % 3) * 6}px`;
      } else {
        bar.style.height = '6px';
      }
    });
  };

  audioEngine.onTimeUpdate = (current, total) => {
    timeCurrentEl.textContent = formatTime(current);
    const percent = Math.min(100, Math.max(0, (current / total) * 100));
    scrubberFill.style.width = `${percent}%`;
    scrubberThumb.style.left = `${percent}%`;

    // Dynamic pulse bars while playing
    if (audioEngine.isPlaying) {
      pulseBars.forEach((bar, i) => {
        const height = 6 + Math.sin((current * 5) + i) * 12 + Math.random() * 8;
        bar.style.height = `${Math.max(4, height)}px`;
      });
    }
  };

  // 6. Player Control Events
  btnPlayPause.addEventListener('click', () => audioEngine.togglePlay());
  btnPrev.addEventListener('click', () => audioEngine.prevTrack());
  btnNext.addEventListener('click', () => audioEngine.nextTrack());

  btnLoop.addEventListener('click', () => {
    const isLooping = audioEngine.toggleLoop();
    btnLoop.classList.toggle('text-primary', isLooping);
  });

  btnShuffle.addEventListener('click', () => {
    const isShuffling = audioEngine.toggleShuffle();
    btnShuffle.classList.toggle('text-primary', isShuffling);
  });

  btnMute.addEventListener('click', () => {
    const isMuted = audioEngine.toggleMute();
    iconVolume.textContent = isMuted ? 'volume_off' : (audioEngine.volume > 0.5 ? 'volume_up' : 'volume_down');
    btnMute.classList.toggle('text-primary', isMuted);
  });

  // Scrubber Seeking
  let isDraggingScrubber = false;
  const handleScrub = (e) => {
    const rect = scrubberTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioEngine.seek(pos);
  };

  scrubberTrack.addEventListener('mousedown', (e) => {
    isDraggingScrubber = true;
    handleScrub(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingScrubber) handleScrub(e);
  });

  window.addEventListener('mouseup', () => {
    isDraggingScrubber = false;
  });

  // Volume Slider
  let isDraggingVolume = false;
  const handleVolume = (e) => {
    const rect = volumeTrack.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioEngine.setVolume(pos);
    volumeFill.style.width = `${pos * 100}%`;
    iconVolume.textContent = pos === 0 ? 'volume_off' : (pos > 0.5 ? 'volume_up' : 'volume_down');
  };

  volumeTrack.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    handleVolume(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) handleVolume(e);
  });

  window.addEventListener('mouseup', () => {
    isDraggingVolume = false;
  });

  // 7. Queue Drawer Handlers
  const toggleQueue = (show) => {
    const isOpen = show !== undefined ? show : !queueDrawer.classList.contains('open');
    queueDrawer.classList.toggle('open', isOpen);
    drawerBackdrop.classList.toggle('open', isOpen);
    if (isOpen) renderQueue();
  };

  btnQueue.addEventListener('click', () => toggleQueue());
  btnCloseQueue.addEventListener('click', () => toggleQueue(false));

  // 8. Ambience Modal Handlers
  const toggleAmbience = (show) => {
    const isOpen = show !== undefined ? show : !ambienceModal.classList.contains('open');
    ambienceModal.classList.toggle('open', isOpen);
    drawerBackdrop.classList.toggle('open', isOpen);
  };

  btnAmbience.addEventListener('click', () => toggleAmbience());
  btnCloseAmbience.addEventListener('click', () => toggleAmbience(false));

  // Ambience Layer Buttons
  document.querySelectorAll('.ambience-card').forEach(card => {
    const layerKey = card.dataset.layer;
    const btnToggle = card.querySelector('.btn-ambience-toggle');
    const slider = card.querySelector('.ambience-slider');

    btnToggle.addEventListener('click', () => {
      const active = ambience.toggleLayer(layerKey);
      card.classList.toggle('active', active);
      btnToggle.textContent = active ? 'Active' : 'Enable';
      btnToggle.classList.toggle('btn-ghost', !active);
      btnToggle.classList.toggle('btn-icon', active);
    });

    if (slider) {
      slider.addEventListener('input', (e) => {
        const vol = parseFloat(e.target.value);
        ambience.setLayerVolume(layerKey, vol);
      });
    }
  });

  // 9. Theme Modal Handlers
  const toggleThemeModal = (show) => {
    const isOpen = show !== undefined ? show : !themeModal.classList.contains('open');
    themeModal.classList.toggle('open', isOpen);
    drawerBackdrop.classList.toggle('open', isOpen);
  };

  btnTheme.addEventListener('click', () => toggleThemeModal());
  btnCloseTheme.addEventListener('click', () => toggleThemeModal(false));

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    });
  });

  // Drawer Backdrop Click
  drawerBackdrop.addEventListener('click', () => {
    toggleQueue(false);
    toggleAmbience(false);
    toggleThemeModal(false);
  });

  // 10. Visualizer Mode Switcher
  const visModes = [
    { key: 'silk-waves', name: 'Silk Waves' },
    { key: 'nebula-glow', name: 'Nebula Glow' },
    { key: 'stardust-pulse', name: 'Stardust Pulse' }
  ];
  let curVisIdx = 0;

  btnVisualizerMode.addEventListener('click', () => {
    curVisIdx = (curVisIdx + 1) % visModes.length;
    visualizer.setMode(visModes[curVisIdx].key);
    visModeText.textContent = visModes[curVisIdx].name;
  });

  // 11. Fullscreen Toggle
  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  });

  // 12. Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        audioEngine.togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        audioEngine.nextTrack();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        audioEngine.prevTrack();
        break;
      case 'ArrowUp':
        e.preventDefault();
        audioEngine.setVolume(Math.min(1, audioEngine.volume + 0.05));
        volumeFill.style.width = `${audioEngine.volume * 100}%`;
        break;
      case 'ArrowDown':
        e.preventDefault();
        audioEngine.setVolume(Math.max(0, audioEngine.volume - 0.05));
        volumeFill.style.width = `${audioEngine.volume * 100}%`;
        break;
      case 'KeyM':
        btnMute.click();
        break;
      case 'KeyF':
        btnFullscreen.click();
        break;
      case 'KeyQ':
        toggleQueue();
        break;
      case 'KeyA':
        toggleAmbience();
        break;
      case 'Escape':
        toggleQueue(false);
        toggleAmbience(false);
        toggleThemeModal(false);
        break;
    }
  });

  // Initial UI update
  updateTrackUI(audioEngine.getCurrentTrack());
});
