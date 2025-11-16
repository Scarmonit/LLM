/**
 * Simple logging utility for MCP server
 */

export function logInfo(message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] INFO: ${message}`);
  if (data) {
    console.error(JSON.stringify(data, null, 2));
  }
}

export function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    if (error instanceof Error) {
      console.error(`  ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(String(error));
    }
  }
}

export function logDebug(message: string, data?: unknown): void {
  if (process.env.DEBUG === "1") {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] DEBUG: ${message}`);
    if (data) {
      console.error(JSON.stringify(data, null, 2));
    }
  }
}
