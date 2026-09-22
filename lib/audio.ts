export function playTone(freq: number, start: number, duration: number, gain: number, ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playChime(volume = 1): void {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const v = Math.max(0.05, Math.min(1, volume || 1)) * 0.35;
    playTone(880, 0, 0.18, v, ctx);
    playTone(660, 0.2, 0.24, v, ctx);
    setTimeout(() => void ctx.close(), 900);
  } catch {
    /* audio unavailable */
  }
}

export function playAdhanTone(volume = 1): void {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const v = Math.max(0.05, Math.min(1, volume || 1)) * 0.4;
    const notes = [440, 440, 587, 587, 660, 660, 880];
    notes.forEach((f, i) => playTone(f, i * 0.55, 0.42, v, ctx));
    setTimeout(() => void ctx.close(), 4200);
  } catch {
    /* audio unavailable */
  }
}

export async function playCustomAudio(url: string, volume = 1): Promise<void> {
  try {
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume || 1));
    await audio.play();
  } catch {
    /* ignore */
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

export function speakText(text: string, lang = "en"): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "ur" ? "ur-PK" : "en";
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}