export const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
};
