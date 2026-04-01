// src/api/retryWrapper.ts
export const retryUntilSuccess = async <T>(
  fn: () => Promise<T>,
  delay = 3000,
): Promise<T> => {
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      // If it's a 4xx error, the server is awake but the user input is wrong.
      // Stop retrying and let the user see the error!
      if (err.status && err.status < 500) {
        throw err;
      }

      console.log("⏳ Server waking up? Retrying in", delay / 1000, "s...");
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};
