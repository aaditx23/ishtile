import type { PathaoClientConfig } from "pathao-courier";

const REQUIRED_ENV_KEYS = [
  "PATHAO_CLIENT_ID",
  "PATHAO_CLIENT_SECRET",
  "PATHAO_USERNAME",
  "PATHAO_PASSWORD",
] as const;

export type RequiredPathaoEnvKey = (typeof REQUIRED_ENV_KEYS)[number] | "PATHAO_WEBHOOK_SECRET";

export function getRequiredPathaoEnv(key: RequiredPathaoEnvKey): string {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getPathaoEnvironment(): NonNullable<PathaoClientConfig["environment"]> {
  const env = process.env.PATHAO_ENVIRONMENT?.toLowerCase();
  return env === "production" ? "production" : "sandbox";
}

export function getPathaoConfigFromEnv(): PathaoClientConfig {
  const baseUrl = process.env.PATHAO_BASE_URL?.trim();

  return {
    clientId: getRequiredPathaoEnv("PATHAO_CLIENT_ID"),
    clientSecret: getRequiredPathaoEnv("PATHAO_CLIENT_SECRET"),
    username: getRequiredPathaoEnv("PATHAO_USERNAME"),
    password: getRequiredPathaoEnv("PATHAO_PASSWORD"),
    environment: getPathaoEnvironment(),
    ...(baseUrl ? ({ baseUrl } as Record<string, string>) : {}),
  } as PathaoClientConfig;
}

export function readPathaoSignature(headers: Headers): string | null {
  return headers.get("x-pathao-signature");
}
