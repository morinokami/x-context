import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnthropicMessagesModelId } from "@ai-sdk/anthropic/internal";
import type { OpenAIChatModelId } from "@ai-sdk/openai/internal";

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
// Generated automatically by scripts/build-supported-models.ts
export const SUPPORTED_MODELS: {
	openai: OpenAIChatModelId[];
	anthropic: AnthropicMessagesModelId[];
} = {
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
} as const;
// TODO: are these the best defaults?
export const DEFAULT_MODELS = {
	openai: "o4-mini",
	anthropic: "claude-4-sonnet-20250514",
} as const;

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
		"https://raw.githubusercontent.com/github/docs/refs/heads/main/content/copilot/how-tos/custom-instructions/adding-personal-custom-instructions-for-github-copilot.md",
	],
	"claude-code": ["https://docs.anthropic.com/en/docs/claude-code/memory.md"],
	cursor: ["https://docs.cursor.com/context/rules.md"],
	"gemini-cli": [
		"https://raw.githubusercontent.com/google-gemini/gemini-cli/refs/heads/main/docs/cli/configuration.md",
	],
} as const;
