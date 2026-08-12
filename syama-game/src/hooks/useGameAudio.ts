import { useRef, useCallback, useState, useEffect } from 'react';

export interface GameAudioController {
  playHover: () => void;
  playCorrect: () => void;
  playWrong: () => void;
  playWin: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

export const useGameAudio = (): GameAudioController => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Helper to get or initialize the AudioContext lazily on user interaction
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Short soft blip (frequency ramp up with exponential decay)
  const playHover = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05); // Ramp to A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio playback errors handled silently
    }
  }, [getAudioContext, isMuted]);

  // Happy ascending magical chime (arpeggiated triad with octave sparkles)
  const playCorrect = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Ascending major chord sequence: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const stepDuration = 0.07;

      notes.forEach((freq, index) => {
        const noteTime = now + index * stepDuration;

        // Base tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        // Sparkle harmonic (octave higher)
        const oscSparkle = ctx.createOscillator();
        const gainSparkle = ctx.createGain();
        oscSparkle.type = 'sine';
        oscSparkle.frequency.setValueAtTime(freq * 2, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        gainSparkle.gain.setValueAtTime(0.001, noteTime);
        gainSparkle.gain.linearRampToValueAtTime(0.05, noteTime + 0.01);
        gainSparkle.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        oscSparkle.connect(gainSparkle);
        gainSparkle.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.35);

        oscSparkle.start(noteTime);
        oscSparkle.stop(noteTime + 0.25);
      });
    } catch {
      // Audio playback errors handled silently
    }
  }, [getAudioContext, isMuted]);

  // Low buzzing error sound (dissonant dual sawtooth with pitch drop & lowpass filter)
  const playWrong = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.linearRampToValueAtTime(150, now + 0.3);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(130.81, now); // C3
      osc1.frequency.linearRampToValueAtTime(98.0, now + 0.3); // Pitch bend down

      osc2.frequency.setValueAtTime(138.59, now); // C#3 (minor 2nd dissonance)
      osc2.frequency.linearRampToValueAtTime(103.83, now + 0.3);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } catch {
      // Audio playback errors handled silently
    }
  }, [getAudioContext, isMuted]);

  // Long triumphant fanfare (intro sequence + held climax chord with vibrato & sparkling arpeggios)
  const playWin = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Staccato fanfare intro notes
      const fanfareSequence = [
        { notes: [392.0], timeOffset: 0.0, duration: 0.12 }, // G4
        { notes: [523.25], timeOffset: 0.14, duration: 0.12 }, // C5
        { notes: [659.25], timeOffset: 0.28, duration: 0.12 }, // E5
        { notes: [783.99], timeOffset: 0.42, duration: 0.2 }, // G5
      ];

      fanfareSequence.forEach(({ notes, timeOffset, duration }) => {
        notes.forEach((freq) => {
          const startTime = now + timeOffset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.18, startTime + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      });

      // Climax Sustained Triumph Chord (C5, E5, G5, C6) with LFO Vibrato
      const climaxTime = now + 0.65;
      const climaxNotes = [523.25, 659.25, 783.99, 1046.5];

      climaxNotes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, climaxTime);

        // Subtly modulate frequency for warmth/vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5, climaxTime);
        lfoGain.gain.setValueAtTime(3, climaxTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(climaxTime);
        lfo.stop(climaxTime + 1.6);

        gain.gain.setValueAtTime(0.001, climaxTime);
        gain.gain.linearRampToValueAtTime(0.12, climaxTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, climaxTime + 1.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(climaxTime);
        osc.stop(climaxTime + 1.6);
      });

      // High magical sparkle cascade during climax
      const sparkleNotes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
      sparkleNotes.forEach((freq, idx) => {
        const sparkleTime = climaxTime + 0.1 + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, sparkleTime);

        gain.gain.setValueAtTime(0.001, sparkleTime);
        gain.gain.linearRampToValueAtTime(0.08, sparkleTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, sparkleTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(sparkleTime);
        osc.stop(sparkleTime + 0.4);
      });
    } catch {
      // Audio playback errors handled silently
    }
  }, [getAudioContext, isMuted]);

  // Clean up AudioContext & global touch unlock listener
  useEffect(() => {
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    playHover,
    playCorrect,
    playWrong,
    playWin,
    isMuted,
    toggleMute,
  };
};

export default useGameAudio;
