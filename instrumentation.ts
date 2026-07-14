export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startRequestLogger } = await import("./lib/request-logger");
    startRequestLogger();
  }
}
