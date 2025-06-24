export function debounce(func: Function, timeout = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}

export function fontSizeClamping(
  minSize: number,
  maxSize: number,
  currentlengthOfNumber: number,
  breakpointLength: number,
): number {
  if (currentlengthOfNumber <= breakpointLength) {
    return maxSize;
  }

  if (currentlengthOfNumber > breakpointLength) {
    const clampedSize = maxSize - (currentlengthOfNumber - breakpointLength);
    if (clampedSize < minSize) {
      return minSize;
    }
    return clampedSize;
  }

  return maxSize;
}

export function condenseAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
