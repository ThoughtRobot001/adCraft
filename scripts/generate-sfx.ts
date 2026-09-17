import fs from "fs";
import path from "path";

/**
 * Encodes raw 16-bit mono PCM samples into a standard RIFF/WAVE buffer.
 */
function createWavBuffer(samples: Float32Array, sampleRate: number = 44100): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataLength = samples.length * 2;
  const bufferLength = 44 + dataLength;

  const buffer = Buffer.alloc(bufferLength);

  // RIFF identifier
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  // fmt subchunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data subchunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(val), offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Generates an audio sweep transition whoosh.
 */
function generateWhoosh(sampleRate: number = 44100, duration: number = 0.45): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  let noise = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / totalSamples;
    // Bell curve amplitude envelope
    const env = Math.sin(Math.PI * t) ** 2;
    // Frequency sweep from 250Hz to 1200Hz back to 300Hz
    const freq = 250 + 950 * Math.sin(Math.PI * t);
    // Filtered pinkish noise
    const white = (Math.random() * 2 - 1);
    noise = noise * 0.88 + white * 0.12;
    // Modulated carrier tone
    const tone = Math.sin(2 * Math.PI * freq * (i / sampleRate));
    samples[i] = (noise * 0.65 + tone * 0.35) * env * 0.85;
  }

  return samples;
}

/**
 * Generates a crisp UI click / transient pop.
 */
function generateClick(sampleRate: number = 44100, duration: number = 0.06): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 90);
    // Transient resonant pop around 1800Hz with quick harmonic drop
    const freq = 2200 * Math.exp(-t * 120) + 450;
    const wave = Math.sin(2 * Math.PI * freq * t);
    samples[i] = wave * decay * 0.9;
  }

  return samples;
}

/**
 * Generates a deep cinematic sub-bass impact drop.
 */
function generateImpact(sampleRate: number = 44100, duration: number = 0.65): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = i / totalSamples;
    const decay = Math.exp(-progress * 5.5);
    // Frequency drops from 140Hz down to 38Hz
    const freq = 38 + (140 - 38) * Math.exp(-progress * 8);
    const sub = Math.sin(2 * Math.PI * freq * t);
    const punch = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
    samples[i] = (sub + punch) * decay * 0.95;
  }

  return samples;
}

/**
 * Generates an exponential upward tension riser.
 */
function generateRiser(sampleRate: number = 44100, duration: number = 0.9): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const progress = i / totalSamples;
    const env = progress ** 1.8; // Gradual swell
    // Frequency rises exponentially from 120Hz to 1100Hz
    const freq = 120 * Math.exp(progress * 2.22);
    phase += (2 * Math.PI * freq) / sampleRate;
    const tone = Math.sin(phase);
    const shimmer = Math.sin(phase * 1.5) * 0.25;
    samples[i] = (tone + shimmer) * env * 0.85;
  }

  return samples;
}

/**
 * Generates a warm harmonic resolution chime (e.g. cash deposit / task completion).
 */
function generateChime(sampleRate: number = 44100, duration: number = 1.2): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  // Fundamental 880Hz (A5) with rich bell harmonics (1760Hz, 2640Hz, 3520Hz)
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const decay1 = Math.exp(-t * 3.2);
    const decay2 = Math.exp(-t * 4.8);
    const decay3 = Math.exp(-t * 7.5);

    const f1 = Math.sin(2 * Math.PI * 880 * t) * decay1 * 0.55;
    const f2 = Math.sin(2 * Math.PI * 1760 * t) * decay2 * 0.28;
    const f3 = Math.sin(2 * Math.PI * 2640 * t) * decay3 * 0.12;
    const f4 = Math.sin(2 * Math.PI * 3520 * t) * decay3 * 0.05;

    samples[i] = (f1 + f2 + f3 + f4) * 0.92;
  }

  return samples;
}

/**
 * Generates a deep resonant sub-bass tension drone (48Hz with LFO pulsing).
 */
function generateTensionDrone(sampleRate: number = 44100, duration: number = 2.0): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.8 * t);
    const sub = Math.sin(2 * Math.PI * 48 * t);
    const subHarmonic = Math.sin(2 * Math.PI * 96 * t) * 0.35;
    const grit = (Math.random() * 2 - 1) * 0.03;

    // Smooth fadeIn (0.2s) and fadeOut (0.3s)
    let env = 1.0;
    if (t < 0.2) env = t / 0.2;
    else if (t > duration - 0.3) env = (duration - t) / 0.3;

    samples[i] = (sub + subHarmonic + grit) * lfo * env * 0.88;
  }

  return samples;
}

/**
 * Generates a tactile mechanical switch click (dual transient keystroke).
 */
function generateSwitch(sampleRate: number = 44100, duration: number = 0.05): Float32Array {
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    // Primary tactile click
    const decay1 = Math.exp(-t * 220);
    const click1 = Math.sin(2 * Math.PI * 3200 * t) * decay1;

    // Secondary bottom-out click at 8ms
    let click2 = 0;
    if (t > 0.008) {
      const t2 = t - 0.008;
      const decay2 = Math.exp(-t2 * 180);
      click2 = Math.sin(2 * Math.PI * 1800 * t2) * decay2 * 0.7;
    }

    samples[i] = (click1 * 0.65 + click2 * 0.35) * 0.95;
  }

  return samples;
}

async function main() {
  console.log("🔊 Generating Broadcast-Grade PCM WAV Audio SFX Library...");

  const outDir = path.resolve(process.cwd(), "public", "audio", "sfx");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const sfxList = [
    { name: "whoosh.wav", generator: generateWhoosh },
    { name: "click.wav", generator: generateClick },
    { name: "impact.wav", generator: generateImpact },
    { name: "riser.wav", generator: generateRiser },
    { name: "chime.wav", generator: generateChime },
    { name: "tension-drone.wav", generator: generateTensionDrone },
    { name: "switch.wav", generator: generateSwitch },
  ];

  for (const item of sfxList) {
    const samples = item.generator();
    const wavBuffer = createWavBuffer(samples);
    const targetFile = path.join(outDir, item.name);
    fs.writeFileSync(targetFile, wavBuffer);
    console.log(`  ✅ Generated: ${targetFile} (${wavBuffer.length} bytes)`);
  }

  console.log(`🎉 All ${sfxList.length} audio SFX synthesized successfully!\n`);
}

main().catch((err) => {
  console.error("❌ Failed to generate SFX:", err);
  process.exit(1);
});
