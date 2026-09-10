type Wave = OscillatorType;

interface Note {
  hz: number;
  at: number;
  seconds: number;
  wave?: Wave;
  gain?: number;
  slideTo?: number;
}

let context: AudioContext | null = null;
let muted = false;

function constructorFor(): typeof AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const scoped = window as Window & { webkitAudioContext?: typeof AudioContext };

  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

function contextFor(): AudioContext | null {
  if (context) {
    return context;
  }

  const Ctor = constructorFor();

  if (!Ctor) {
    return null;
  }

  try {
    context = new Ctor();
  } catch {
    return null;
  }

  return context;
}

export function applyMuted(next: boolean) {
  muted = next;
}

export function unlockSound() {
  const audio = contextFor();

  if (audio && audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }
}

function play(notes: readonly Note[]) {
  if (muted) {
    return;
  }

  const audio = contextFor();

  if (!audio) {
    return;
  }

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  try {
    const start = audio.currentTime + 0.01;

    for (const note of notes) {
      const tone = audio.createOscillator();
      const level = audio.createGain();
      const from = start + note.at;
      const peak = note.gain ?? 0.12;

      tone.type = note.wave ?? "sine";
      tone.frequency.setValueAtTime(note.hz, from);

      if (note.slideTo) {
        tone.frequency.exponentialRampToValueAtTime(note.slideTo, from + note.seconds);
      }

      level.gain.setValueAtTime(0.0001, from);
      level.gain.exponentialRampToValueAtTime(peak, from + 0.012);
      level.gain.exponentialRampToValueAtTime(0.0001, from + note.seconds);

      tone.connect(level);
      level.connect(audio.destination);
      tone.start(from);
      tone.stop(from + note.seconds + 0.02);
    }
  } catch {
    return;
  }
}

function noise(seconds: number, gain: number, from: number, to: number) {
  if (muted) {
    return;
  }

  const audio = contextFor();

  if (!audio) {
    return;
  }

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  try {
    const frames = Math.floor(audio.sampleRate * seconds);
    const buffer = audio.createBuffer(1, frames, audio.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frames; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frames);
    }

    const source = audio.createBufferSource();
    const band = audio.createBiquadFilter();
    const level = audio.createGain();
    const start = audio.currentTime + 0.01;

    source.buffer = buffer;
    band.type = "bandpass";
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(from, start);
    band.frequency.exponentialRampToValueAtTime(to, start + seconds);

    level.gain.setValueAtTime(gain, start);
    level.gain.exponentialRampToValueAtTime(0.0001, start + seconds);

    source.connect(band);
    band.connect(level);
    level.connect(audio.destination);
    source.start(start);
    source.stop(start + seconds);
  } catch {
    return;
  }
}

export const sound = {
  tap: () => play([{ hz: 660, at: 0, seconds: 0.06, wave: "triangle", gain: 0.07 }]),

  turn: () =>
    play([
      { hz: 659.25, at: 0, seconds: 0.1, wave: "triangle", gain: 0.13 },
      { hz: 987.77, at: 0.09, seconds: 0.12, wave: "triangle", gain: 0.13 },
      { hz: 1318.5, at: 0.19, seconds: 0.22, wave: "triangle", gain: 0.12 },
    ]),

  card: () =>
    play([
      { hz: 220, at: 0, seconds: 0.14, wave: "sawtooth", gain: 0.07, slideTo: 520 },
      { hz: 880, at: 0.1, seconds: 0.16, wave: "sine", gain: 0.1 },
    ]),

  wrote: () => play([{ hz: 880, at: 0, seconds: 0.09, wave: "sine", gain: 0.09 }]),

  reveal: () =>
    play([
      { hz: 330, at: 0, seconds: 0.18, wave: "square", gain: 0.06, slideTo: 880 },
      { hz: 1174.66, at: 0.16, seconds: 0.2, wave: "triangle", gain: 0.1 },
    ]),

  safe: () =>
    play([
      { hz: 523.25, at: 0, seconds: 0.11, wave: "sine", gain: 0.12 },
      { hz: 659.25, at: 0.1, seconds: 0.11, wave: "sine", gain: 0.12 },
      { hz: 783.99, at: 0.2, seconds: 0.26, wave: "sine", gain: 0.13 },
    ]),

  caught: () => {
    noise(0.42, 0.16, 2600, 240);
    play([
      { hz: 392, at: 0.04, seconds: 0.16, wave: "square", gain: 0.09, slideTo: 174.61 },
      { hz: 196, at: 0.18, seconds: 0.32, wave: "sawtooth", gain: 0.1, slideTo: 87.31 },
    ]);
  },

  splash: () => noise(0.34, 0.13, 3200, 420),

  bubble: () =>
    play([
      { hz: 420, at: 0, seconds: 0.09, wave: "sine", gain: 0.08, slideTo: 1100 },
      { hz: 520, at: 0.08, seconds: 0.08, wave: "sine", gain: 0.07, slideTo: 1400 },
      { hz: 640, at: 0.15, seconds: 0.1, wave: "sine", gain: 0.06, slideTo: 1700 },
    ]),

  win: () =>
    play([
      { hz: 523.25, at: 0, seconds: 0.12, wave: "triangle", gain: 0.13 },
      { hz: 659.25, at: 0.11, seconds: 0.12, wave: "triangle", gain: 0.13 },
      { hz: 783.99, at: 0.22, seconds: 0.12, wave: "triangle", gain: 0.13 },
      { hz: 1046.5, at: 0.33, seconds: 0.36, wave: "triangle", gain: 0.14 },
    ]),
};
