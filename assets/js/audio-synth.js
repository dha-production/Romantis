/**
 * audio-synth.js - Romantic Audio Engine
 * High-fidelity Web Audio API romantic piano synthesizer, atmospheric soundscapes,
 * and delicate acoustic sound effects. 100% standalone, works offline and never breaks.
 */

class RomanticAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentMode = 'piano'; // 'piano', 'rain-piano', 'custom'
        this.volume = 0.65;
        this.masterGain = null;
        this.reverbNode = null;
        this.ambientGain = null;
        this.ambientSource = null;
        this.melodyTimeout = null;
        this.noteIndex = 0;
        this.melodyStep = 0;
        this.customAudio = null;
        this.analyser = null;
        this.frequencyData = null;
        this.listeners = [];

        // Romantic Chord Progression & Arpeggios (Key of D Major / B Minor Romantic ballad)
        // Frequencies in Hz
        this.notes = {
            'D3': 146.83, 'F#3': 185.00, 'A3': 220.00,
            'B2': 123.47, 'D4': 293.66, 'E4': 329.63,
            'F#4': 369.99, 'G4': 392.00, 'A4': 440.00,
            'B4': 493.88, 'C#5': 554.37, 'D5': 587.33,
            'E5': 659.25, 'F#5': 739.99, 'A5': 880.00,
            'G3': 196.00, 'C#4': 277.18, 'E3': 164.81
        };

        // Romantic Score: [note, duration in beats, velocity, octave/octaveShift]
        this.score = [
            // Measure 1: D Major arpeggio & tender melody
            { note: 'D3', dur: 2.0, vel: 0.5 },
            { note: 'A3', dur: 1.0, vel: 0.4 },
            { note: 'D4', dur: 1.0, vel: 0.45 },
            { note: 'F#4', dur: 1.5, vel: 0.6 },
            { note: 'A4', dur: 0.75, vel: 0.5 },
            { note: 'D5', dur: 2.0, vel: 0.65 },
            { note: 'C#5', dur: 1.0, vel: 0.5 },
            { note: 'A4', dur: 1.0, vel: 0.45 },

            // Measure 2: B Minor (deep emotional warmth)
            { note: 'B2', dur: 2.0, vel: 0.5 },
            { note: 'F#3', dur: 1.0, vel: 0.4 },
            { note: 'B4', dur: 1.5, vel: 0.55 },
            { note: 'D5', dur: 1.0, vel: 0.6 },
            { note: 'F#5', dur: 2.0, vel: 0.7 },
            { note: 'E5', dur: 1.0, vel: 0.55 },
            { note: 'D5', dur: 1.0, vel: 0.5 },

            // Measure 3: G Major (warm gentle hope)
            { note: 'G3', dur: 2.0, vel: 0.5 },
            { note: 'D4', dur: 1.0, vel: 0.4 },
            { note: 'G4', dur: 1.0, vel: 0.45 },
            { note: 'B4', dur: 1.5, vel: 0.6 },
            { note: 'D5', dur: 1.0, vel: 0.65 },
            { note: 'E5', dur: 2.0, vel: 0.6 },
            { note: 'D5', dur: 1.0, vel: 0.5 },
            { note: 'B4', dur: 1.0, vel: 0.45 },

            // Measure 4: A Major (tender resolution & longing)
            { note: 'A3', dur: 2.0, vel: 0.5 },
            { note: 'E4', dur: 1.0, vel: 0.4 },
            { note: 'A4', dur: 1.0, vel: 0.45 },
            { note: 'C#5', dur: 1.5, vel: 0.6 },
            { note: 'E5', dur: 1.5, vel: 0.65 },
            { note: 'A5', dur: 2.5, vel: 0.7 },
            { note: 'F#5', dur: 1.0, vel: 0.5 },
            { note: 'E5', dur: 1.0, vel: 0.45 },

            // Measure 5: Variation with higher emotional bloom
            { note: 'D4', dur: 1.5, vel: 0.5 },
            { note: 'F#4', dur: 1.0, vel: 0.45 },
            { note: 'A4', dur: 1.0, vel: 0.5 },
            { note: 'F#5', dur: 2.5, vel: 0.75 },
            { note: 'E5', dur: 1.0, vel: 0.6 },
            { note: 'D5', dur: 1.5, vel: 0.55 },
            { note: 'B4', dur: 1.5, vel: 0.5 },

            // Measure 6: Gentle descent into quiet heartbeats
            { note: 'G4', dur: 2.0, vel: 0.5 },
            { note: 'B4', dur: 1.5, vel: 0.55 },
            { note: 'D5', dur: 2.0, vel: 0.6 },
            { note: 'C#5', dur: 2.5, vel: 0.55 },
            { note: 'A4', dur: 2.0, vel: 0.5 },
            { note: 'D4', dur: 3.0, vel: 0.4 }
        ];

        this.initCustomAudio();
    }

    initContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();

            // Master Gain Node
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

            // Analyser for visualizers (Equalizer)
            this.analyser = this.ctx.createAnalyser();
            this.analyser.fftSize = 64;
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

            // Reverb Simulation (Convolver-like delay feedback network)
            this.setupReverb();

            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.ctx.destination);
        }

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setupReverb() {
        const delay = this.ctx.createDelay();
        delay.delayTime.setValueAtTime(0.35, this.ctx.currentTime);

        const feedback = this.ctx.createGain();
        feedback.gain.setValueAtTime(0.42, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, this.ctx.currentTime);

        delay.connect(feedback);
        feedback.connect(filter);
        filter.connect(delay);
        filter.connect(this.masterGain);

        this.reverbNode = delay;
    }

    initCustomAudio() {
        this.customAudio = new Audio();
        this.customAudio.loop = true;
        this.customAudio.crossOrigin = 'anonymous';
    }

    // Polyphonic Romantic Piano Note Synthesis
    playPianoNote(freq, dur = 2.0, vel = 0.5) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // 1. Fundamental Oscillator (Triangle for rich acoustic body)
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);

        // 2. Harmonic Tone (Warm Sine for gentle bell chime)
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, now);
        // Subtle detune for lush concert grand chorus
        osc2.detune.setValueAtTime(4, now);

        // 3. Sub-harmonic Warmth
        const osc3 = this.ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 0.5, now);

        // Envelope Generator (ADSR tailored for romantic acoustic piano)
        const noteGain = this.ctx.createGain();
        const peakGain = vel * 0.35;
        noteGain.gain.setValueAtTime(0.0001, now);
        // Attack
        noteGain.gain.exponentialRampToValueAtTime(peakGain, now + 0.04);
        // Decay to sustain
        noteGain.gain.exponentialRampToValueAtTime(peakGain * 0.45, now + 0.3);
        // Long natural release
        noteGain.gain.exponentialRampToValueAtTime(0.00001, now + dur);

        // Acoustic dampening lowpass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(freq * 5, 4500), now);
        filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2, 1200), now + dur);

        // Routing
        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(noteGain);

        noteGain.connect(this.masterGain);
        if (this.reverbNode) {
            noteGain.connect(this.reverbNode);
        }

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        osc1.stop(now + dur + 0.1);
        osc2.stop(now + dur + 0.1);
        osc3.stop(now + dur + 0.1);
    }

    // Play next note in melody loop
    stepMelody() {
        if (!this.isPlaying || this.currentMode === 'custom') return;

        const noteObj = this.score[this.noteIndex];
        const freq = this.notes[noteObj.note] || 440;
        const durSec = noteObj.dur * 0.72; // tempo scaling

        this.playPianoNote(freq, durSec * 1.8, noteObj.vel);

        // Notify listeners of note for visual sparkles / pulse
        this.emitNoteEvent(noteObj.note, noteObj.vel);

        this.noteIndex = (this.noteIndex + 1) % this.score.length;

        // Schedule next step
        this.melodyTimeout = setTimeout(() => {
            this.stepMelody();
        }, durSec * 1000);
    }

    start() {
        this.initContext();
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (this.currentMode === 'custom' && this.customAudio.src) {
            this.customAudio.play().catch(e => console.warn('Audio play prevented:', e));
        } else {
            if (this.currentMode === 'rain-piano') {
                this.startRainAmbient();
            }
            this.stepMelody();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.melodyTimeout) {
            clearTimeout(this.melodyTimeout);
            this.melodyTimeout = null;
        }
        if (this.ambientSource) {
            this.ambientSource.stop();
            this.ambientSource = null;
        }
        if (this.customAudio) {
            this.customAudio.pause();
        }
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
        if (this.customAudio) {
            this.customAudio.volume = this.volume;
        }
    }

    // Generates soothing gentle rain sound synthesis
    startRainAmbient() {
        if (!this.ctx || this.ambientSource) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;

        // Pink/Brown noise for gentle raindrops
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        whiteNoise.connect(rainFilter);
        rainFilter.connect(this.ambientGain);
        this.ambientGain.connect(this.masterGain);

        whiteNoise.start();
        this.ambientSource = whiteNoise;
    }

    setMode(mode, customUrl = null) {
        const wasPlaying = this.isPlaying;
        this.pause();
        this.currentMode = mode;

        if (mode === 'custom' && customUrl) {
            this.customAudio.src = customUrl;
        }

        if (wasPlaying) {
            this.start();
        }
    }

    // --- Romantic Interactive Sound Effects ---

    // Wax seal break sound: soft pop + mystical bell glissando
    playSealBreak() {
        this.initContext();
        const now = this.ctx.currentTime;

        // Soft pop
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.frequency.setValueAtTime(260, now);
        popOsc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        popGain.gain.setValueAtTime(0.4, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        popOsc.connect(popGain);
        popGain.connect(this.masterGain);
        popOsc.start(now);
        popOsc.stop(now + 0.16);

        // Magical wind chime sparkles (harp glissando: E5, G#5, B5, E6)
        const chimeNotes = [659.25, 830.61, 987.77, 1318.51, 1661.22];
        chimeNotes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + 0.08 + (idx * 0.06);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

            osc.connect(gain);
            gain.connect(this.masterGain);
            if (this.reverbNode) gain.connect(this.reverbNode);

            osc.start(t);
            osc.stop(t + 1.0);
        });
    }

    // Heart sparkle chime (when user clicks anywhere)
    playHeartChime() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const pitches = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
        const freq = pitches[Math.floor(Math.random() * pitches.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Typewriter soft gentle tick
    playTypewriterClick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 300, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    // Celebration Fanfare (Proposal "Iya" clicked)
    playLoveCelebration() {
        this.initContext();
        const now = this.ctx.currentTime;
        const fanfare = [
            { f: 523.25, t: 0.0, d: 0.3 },   // C5
            { f: 659.25, t: 0.15, d: 0.3 },  // E5
            { f: 783.99, t: 0.30, d: 0.3 },  // G5
            { f: 1046.50, t: 0.45, d: 0.8 }, // C6
            { f: 1318.51, t: 0.70, d: 1.2 }, // E6
            { f: 1567.98, t: 0.95, d: 2.0 }  // G6
        ];

        fanfare.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const time = now + note.t;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, time);

            gain.gain.setValueAtTime(0.001, time);
            gain.gain.exponentialRampToValueAtTime(0.35, time + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + note.d);

            osc.connect(gain);
            gain.connect(this.masterGain);
            if (this.reverbNode) gain.connect(this.reverbNode);

            osc.start(time);
            osc.stop(time + note.d + 0.1);
        });
    }

    getVisualizerData() {
        if (!this.analyser || !this.frequencyData) {
            return new Uint8Array(16);
        }
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }

    onNote(fn) {
        this.listeners.push(fn);
    }

    emitNoteEvent(note, vel) {
        this.listeners.forEach(fn => fn(note, vel));
    }
}

// Global instance
window.RomanticAudio = new RomanticAudioEngine();
