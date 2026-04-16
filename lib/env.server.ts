import "server-only";

function readServerEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    return null;
  }

  return value;
}

export function getOptionalGeminiApiKey() {
  return readServerEnv("GEMINI_API_KEY");
}

export function getGeminiApiKey() {
  const apiKey = getOptionalGeminiApiKey();

  if (!apiKey) {
    throw new Error(
      "Missing required server environment variable: GEMINI_API_KEY"
    );
  }

  return apiKey;
}
