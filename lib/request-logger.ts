export function startRequestLogger() {
  if (typeof globalThis !== "undefined") {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input, init?) => {
      const start = Date.now();
      const url = typeof input === "string" ? input : "url" in input ? (input as Request).url : String(input);
      try {
        const response = await originalFetch(input, init);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === "production") {
          console.log(
            JSON.stringify({
              level: "info",
              ts: new Date().toISOString(),
              event: "outbound_request",
              method: init?.method ?? "GET",
              url,
              status: response.status,
              durationMs: duration,
            })
          );
        }
        return response;
      } catch (error) {
        const duration = Date.now() - start;
        console.error(
          JSON.stringify({
            level: "error",
            ts: new Date().toISOString(),
            event: "outbound_request_failed",
            method: init?.method ?? "GET",
            url,
            durationMs: duration,
            error: error instanceof Error ? error.message : String(error),
          })
        );
        throw error;
      }
    };
  }
}
