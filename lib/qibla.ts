const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const KAABA_LAT = 21.4225 * D2R;
const KAABA_LNG = 39.8262 * D2R;

export function qiblaBearing(lat: number, lng: number): number {
  const φ = lat * D2R;
  const λ = lng * D2R;
  const Δλ = KAABA_LNG - λ;
  const y = Math.sin(Δλ) * Math.cos(KAABA_LAT);
  const x = Math.cos(φ) * Math.sin(KAABA_LAT) - Math.sin(φ) * Math.cos(KAABA_LAT) * Math.cos(Δλ);
  let θ = Math.atan2(y, x) * R2D;
  if (θ < 0) θ += 360;
  return θ;
}

export function directionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const i = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return dirs[i];
}