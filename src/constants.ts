export const supportedFormats = [
	"copilot",
	"claude-code",
	"cursor",
	"gemini-cli",
] as const;

export const supportedProviders = ["openai", "anthropic"] as const;

export type SupportedFormat = (typeof supportedFormats)[number];
export type SupportedProvider = (typeof supportedProviders)[number];
