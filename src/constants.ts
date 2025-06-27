import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

export const packageVersion = packageJson.version;

export const supportedFormats = [
	"copilot",
	"claude-code",
	"cursor",
	"gemini-cli",
] as const;

export const supportedProviders = ["openai", "anthropic"] as const;

export type SupportedFormat = (typeof supportedFormats)[number];
export type SupportedProvider = (typeof supportedProviders)[number];

export const configDocuments = {
	copilot: [
		"https://raw.githubusercontent.com/github/docs/refs/heads/main/content/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot.md",
	],
	"claude-code": ["https://docs.anthropic.com/en/docs/claude-code/memory.md"],
	cursor: ["https://docs.cursor.com/context/rules.md"],
	"gemini-cli": [
		"https://raw.githubusercontent.com/google-gemini/gemini-cli/refs/heads/main/docs/cli/configuration.md",
	],
} as const;
