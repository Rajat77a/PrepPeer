import "server-only";

export const logServerError = (
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>
) => {
  console.error(context, {
    error,
    metadata,
    timestamp: new Date().toISOString(),
  });
};
