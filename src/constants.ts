export const supportedFormats = [
	"copilot",
	"claude-code",
	"cursor",
	"gemini-cli",
] as const;

export type SupportedFormat = (typeof supportedFormats)[number];
