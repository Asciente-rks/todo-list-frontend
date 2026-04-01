// src/api/retryWrapper.ts
export const retryUntilSuccess = async <T>(
  fn: () => Promise<T>,
  delay = 3000,
): Promise<T> => {
  while (true) {
    try {
      return await fn();
    } catch (err) {
      console.log("⏳ Request failed, retrying in", delay / 1000, "s");
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};
