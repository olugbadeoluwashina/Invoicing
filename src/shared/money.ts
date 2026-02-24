export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function toNaira(kobo: number): number {
  return kobo / 100;
}
