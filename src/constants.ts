import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const supportedFormats = [
	"copilot",
	"claude-code",
	"cursor",
	"gemini-cli",
] as const;

export const supportedProviders = ["openai", "anthropic"] as const;

export type SupportedFormat = (typeof supportedFormats)[number];
export type SupportedProvider = (typeof supportedProviders)[number];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

export const packageVersion = packageJson.version;
