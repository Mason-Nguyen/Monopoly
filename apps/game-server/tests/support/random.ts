export async function withMockedMathRandom<T>(
  values: number[],
  callback: () => Promise<T> | T
): Promise<T> {
  const originalRandom = Math.random;
  let nextIndex = 0;

  Math.random = () => {
    if (nextIndex >= values.length) {
      return originalRandom();
    }

    const value = values[nextIndex]!;
    nextIndex += 1;
    return value;
  };

  try {
    return await callback();
  } finally {
    Math.random = originalRandom;
  }
}

