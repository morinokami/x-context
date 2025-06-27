import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

export const packageVersion = packageJson.version;

// TODO: support more formats and providers
export const SUPPORTED_FORMATS = [
	"copilot",
	"claude-code",
	"cursor",
	"gemini-cli",
] as const;
export const SUPPORTED_PROVIDERS = ["openai", "anthropic"] as const;

export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const TOOL_NAME: Record<SupportedFormat, string> = {
	copilot: "GitHub Copilot",
	"claude-code": "Claude Code",
	cursor: "Cursor",
	"gemini-cli": "Gemini CLI",
} as const;
export const PROVIDER_NAME: Record<SupportedProvider, string> = {
	openai: "OpenAI",
	anthropic: "Anthropic",
} as const;

export const DOC_URL = {
	copilot: [
		"https://raw.githubusercontent.com/github/docs/refs/heads/main/content/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot.md",
	],
	"claude-code": ["https://docs.anthropic.com/en/docs/claude-code/memory.md"],
	cursor: ["https://docs.cursor.com/context/rules.md"],
	"gemini-cli": [
		"https://raw.githubusercontent.com/google-gemini/gemini-cli/refs/heads/main/docs/cli/configuration.md",
	],
} as const;
