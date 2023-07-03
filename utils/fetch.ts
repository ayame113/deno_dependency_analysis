export class Fetcher {
  readonly #defaultRateLimit;
  #rateLimits: Record<string, number | undefined> = {};
  constructor({ rateLimit = 300 }: { rateLimit?: number } = {}) {
    this.#defaultRateLimit = rateLimit;
    const timeoutId = setInterval(() => {
      console.log("reset rate limit");
      this.#rateLimits = {};
    }, 60 * 1000);
    Deno.unrefTimer(timeoutId);
  }
  async fetch(input: string | URL, init?: RequestInit) {
    const { hostname } = new URL(input);
    const rateLimit = this.#rateLimits[hostname];
    if (rateLimit !== undefined && rateLimit <= 0) {
      throw new RateLimitError();
    }
    if (rateLimit !== undefined) {
      this.#rateLimits[hostname] = rateLimit - 1;
    } else {
      this.#rateLimits[hostname] = this.#defaultRateLimit;
    }
    console.log("rate limit:", this.#rateLimits[hostname], input);
    return await fetch(input, init);
  }
}

export const fetcher = new Fetcher();

export class RateLimitError extends Error {}
