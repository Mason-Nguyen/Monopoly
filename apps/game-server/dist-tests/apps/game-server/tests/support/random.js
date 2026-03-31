export async function withMockedMathRandom(values, callback) {
    const originalRandom = Math.random;
    let nextIndex = 0;
    Math.random = () => {
        if (nextIndex >= values.length) {
            return originalRandom();
        }
        const value = values[nextIndex];
        nextIndex += 1;
        return value;
    };
    try {
        return await callback();
    }
    finally {
        Math.random = originalRandom;
    }
}
