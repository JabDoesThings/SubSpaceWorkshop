export const clamp = (value: number, min: number = 0, max: number = 1): number => {
  if (value > max) {
    value = max;
  } else if (value < min) {
    value = min;
  }
  return value;
};
