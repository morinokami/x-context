import type { SupportedFormat } from "./constants";

export function convertConfig(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
): string {
	// TODO: Implement actual conversion logic
	return `# Converted from ${from} to ${to}\n\n${content}`;
}
