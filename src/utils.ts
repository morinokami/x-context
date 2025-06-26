import type { SupportedProvider } from "./constants";

export function validateEnvironmentVariables(
	provider: SupportedProvider,
): void {
	if (provider === "openai" && !process.env.OPENAI_API_KEY) {
		console.error(
			"Error: OPENAI_API_KEY environment variable is required for OpenAI provider",
		);
		process.exit(1);
	}

	if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
		console.error(
			"Error: ANTHROPIC_API_KEY environment variable is required for Anthropic provider",
		);
		process.exit(1);
	}
}
