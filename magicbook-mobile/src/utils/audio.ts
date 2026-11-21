// Sound manager utilizing authentic extracted retro sounds from The MagicBook V7
type SoundType = 'tap' | 'color' | 'fill' | 'brush' | 'page' | 'clear' | 'sparkle' | 'cheer';

const SOUND_FILES: Record<SoundType, string> = {
  tap: '/sounds/sound_01.wav',
  color: '/sounds/sound_02.wav',
  fill: '/sounds/sound_03.wav',
  brush: '/sounds/sound_05.wav',
  cheer: '/sounds/sound_08.wav',
  sparkle: '/sounds/sound_10.wav',
  page: '/sounds/sound_12.wav',
  clear: '/sounds/sound_20.wav',
};

class AudioManager {
  private enabled: boolean = true;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioCtx: AudioContext | null = null;

  constructor() {
    const saved = localStorage.getItem('magicbook_sound');
    this.enabled = saved !== null ? saved === 'true' : true;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('magicbook_sound', String(this.enabled));
    if (this.enabled) {
      this.play('tap');
    }
    return this.enabled;
  }

  public play(type: SoundType) {
    if (!this.enabled) return;

    try {
      const src = SOUND_FILES[type];
      let audio = this.audioCache.get(src);
      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        this.audioCache.set(src, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback to synthesized audio if blocked by autoplay policy
        this.playSynthesized(type);
      });
    } catch {
      this.playSynthesized(type);
    }
  }

  private playSynthesized(type: SoundType) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx && AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'tap') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'fill') {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'color' || type === 'sparkle') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.10); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'page') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'cheer') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }
}

export const audioManager = new AudioManager();

