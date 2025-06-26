import type { supportedFormats, supportedProviders } from "./constants";

type SupportedFormat = (typeof supportedFormats)[number];
type SupportedProvider = (typeof supportedProviders)[number];

export function convertConfig(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
): string {
	// TODO: Implement actual conversion logic
	return `# Converted from ${from} to ${to} (provider: ${provider})\n\n${content}`;
}
