import { Howl, Howler } from 'howler';
import { AUDIO_FILES } from '../render/assets';

class AudioManager {
  private sounds = new Map<string, Howl>();
  private current: Howl | null = null;
  private currentName = '';
  musicVolume = 0.5;
  sfxVolume = 0.8;
  muted = false;

  init(): void {
    if (this.sounds.size > 0) return;
    for (const [name, src] of Object.entries(AUDIO_FILES)) {
      const isMusic = name.startsWith('bgm');
      this.sounds.set(
        name,
        new Howl({
          src: [src],
          loop: isMusic,
          volume: isMusic ? this.musicVolume : this.sfxVolume,
          html5: isMusic,
          preload: true,
        }),
      );
    }
    Howler.volume(1);
  }

  play(name: string): void {
    if (this.muted) return;
    const s = this.sounds.get(name);
    if (!s) return;
    s.volume(this.sfxVolume);
    s.play();
  }

  music(name: string): void {
    if (this.currentName === name && this.current?.playing()) return;
    this.current?.stop();
    const s = this.sounds.get(name);
    if (!s) return;
    this.current = s;
    this.currentName = name;
    s.volume(this.musicVolume);
    if (!this.muted) s.play();
  }

  stopMusic(): void {
    this.current?.stop();
    this.currentName = '';
  }

  setMusicVolume(v: number): void {
    this.musicVolume = v;
    this.current?.volume(v);
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = v;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    Howler.mute(muted);
    if (!muted && this.current && !this.current.playing()) this.current.play();
  }
}

export const audio = new AudioManager();
