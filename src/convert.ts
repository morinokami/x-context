import type { SupportedFormat, SupportedProvider } from "./constants";

export function convertConfig(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
): string {
	// TODO: Implement actual conversion logic
	return `# Converted from ${from} to ${to} (provider: ${provider})\n\n${content}`;
}
