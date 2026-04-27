export const pseudoRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
};

export const secureRandom = (): number => {
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  return randomArray[0] / 0xff_ff_ff_ff;
};
