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
	"claude-code",
	"copilot",
	"cursor",
	"gemini-cli",
] as const;
export const SUPPORTED_PROVIDERS = ["anthropic", "gemini", "openai"] as const;
// Generated automatically by scripts/build-supported-models.ts
export const SUPPORTED_MODEL = {
	anthropic: [
		"claude-4-opus-20250514",
		"claude-4-sonnet-20250514",
		"claude-3-7-sonnet-20250219",
		"claude-3-5-sonnet-latest",
		"claude-3-5-sonnet-20241022",
		"claude-3-5-sonnet-20240620",
		"claude-3-5-haiku-latest",
		"claude-3-5-haiku-20241022",
		"claude-3-opus-latest",
		"claude-3-opus-20240229",
		"claude-3-sonnet-20240229",
		"claude-3-haiku-20240307",
	],
	gemini: [
		"gemini-1.5-flash",
		"gemini-1.5-flash-latest",
		"gemini-1.5-flash-001",
		"gemini-1.5-flash-002",
		"gemini-1.5-flash-8b",
		"gemini-1.5-flash-8b-latest",
		"gemini-1.5-flash-8b-001",
		"gemini-1.5-pro",
		"gemini-1.5-pro-latest",
		"gemini-1.5-pro-001",
		"gemini-1.5-pro-002",
		"gemini-2.0-flash",
		"gemini-2.0-flash-001",
		"gemini-2.0-flash-live-001",
		"gemini-2.0-flash-lite",
		"gemini-2.0-pro-exp-02-05",
		"gemini-2.0-flash-thinking-exp-01-21",
		"gemini-2.0-flash-exp",
		"gemini-2.5-pro-exp-03-25",
		"gemini-2.5-pro-preview-05-06",
		"gemini-2.5-flash-preview-04-17",
		"gemini-exp-1206",
		"gemma-3-27b-it",
		"learnlm-1.5-pro-experimental",
	],
	openai: [
		"o1",
		"o1-2024-12-17",
		"o1-mini",
		"o1-mini-2024-09-12",
		"o1-preview",
		"o1-preview-2024-09-12",
		"o3-mini",
		"o3-mini-2025-01-31",
		"o3",
		"o3-2025-04-16",
		"o4-mini",
		"o4-mini-2025-04-16",
		"gpt-4.1",
		"gpt-4.1-2025-04-14",
		"gpt-4.1-mini",
		"gpt-4.1-mini-2025-04-14",
		"gpt-4.1-nano",
		"gpt-4.1-nano-2025-04-14",
		"gpt-4o",
		"gpt-4o-2024-05-13",
		"gpt-4o-2024-08-06",
		"gpt-4o-2024-11-20",
		"gpt-4o-audio-preview",
		"gpt-4o-audio-preview-2024-10-01",
		"gpt-4o-audio-preview-2024-12-17",
		"gpt-4o-search-preview",
		"gpt-4o-search-preview-2025-03-11",
		"gpt-4o-mini-search-preview",
		"gpt-4o-mini-search-preview-2025-03-11",
		"gpt-4o-mini",
		"gpt-4o-mini-2024-07-18",
		"gpt-4-turbo",
		"gpt-4-turbo-2024-04-09",
		"gpt-4-turbo-preview",
		"gpt-4-0125-preview",
		"gpt-4-1106-preview",
		"gpt-4",
		"gpt-4-0613",
		"gpt-4.5-preview",
		"gpt-4.5-preview-2025-02-27",
		"gpt-3.5-turbo-0125",
		"gpt-3.5-turbo",
		"gpt-3.5-turbo-1106",
		"chatgpt-4o-latest",
	],
} as const;
// TODO: are these the best defaults?
export const DEFAULT_MODEL = {
	anthropic: "claude-4-sonnet-20250514",
	gemini: "gemini-2.5-flash-preview-04-17",
	openai: "o4-mini",
} as const;

export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];
export type SupportedAnthropicModel =
	(typeof SUPPORTED_MODEL.anthropic)[number];
export type SupportedGeminiModel = (typeof SUPPORTED_MODEL.gemini)[number];
export type SupportedOpenAIModel = (typeof SUPPORTED_MODEL.openai)[number];

export const TOOL_NAME: Record<SupportedFormat, string> = {
	"claude-code": "Claude Code",
	copilot: "GitHub Copilot",
	cursor: "Cursor",
	"gemini-cli": "Gemini CLI",
} as const;
export const PROVIDER_NAME: Record<SupportedProvider, string> = {
	anthropic: "Anthropic",
	gemini: "Gemini",
	openai: "OpenAI",
} as const;

export const DOC_URL = {
	"claude-code": ["https://docs.anthropic.com/en/docs/claude-code/memory.md"],
	copilot: [
		// TODO: should be https://docs.github.com/en/copilot/how-tos/custom-instructions/adding-repository-custom-instructions-for-github-copilot?tool=vscode
		"https://raw.githubusercontent.com/github/docs/refs/heads/main/content/copilot/how-tos/custom-instructions/adding-personal-custom-instructions-for-github-copilot.md",
	],
	cursor: ["https://docs.cursor.com/context/rules.md"],
	"gemini-cli": [
		"https://raw.githubusercontent.com/google-gemini/gemini-cli/refs/heads/main/docs/cli/configuration.md",
	],
} as const;
