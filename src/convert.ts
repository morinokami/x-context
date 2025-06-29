import { createInterface } from "node:readline";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { Ora } from "ora";
import { z } from "zod";

import type {
	SupportedAnthropicModel,
	SupportedFormat,
	SupportedGeminiModel,
	SupportedOpenAIModel,
	SupportedProvider,
} from "./constants";
import { DOC_URL, PROVIDER_NAME, TOOL_NAME } from "./constants";

export async function convertContext(
	contents: { path: string; content: string }[],
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
	modelId:
		| SupportedAnthropicModel
		| SupportedGeminiModel
		| SupportedOpenAIModel,
	spinner: Ora,
) {
	spinner.start("Fetching documentation...");
	const sourceContextDocuments = await Promise.all(
		DOC_URL[from].map((url) => fetch(url).then((res) => res.text())),
	);
	const targetContextDocuments = await Promise.all(
		DOC_URL[to].map((url) => fetch(url).then((res) => res.text())),
	);
	spinner.succeed("Documentation fetched successfully");

	spinner.start(
		`Generating ${TOOL_NAME[to]} context files using ${PROVIDER_NAME[provider]} ${modelId}...`,
	);
	const generatedContext = await generateContext(
		contents,
		sourceContextDocuments,
		targetContextDocuments,
		provider,
		modelId,
	);
	spinner.succeed("Context files converted successfully");

	return generatedContext;
}

async function generateContext(
	contents: { path: string; content: string }[],
	sourceContextDocuments: string[],
	targetContextDocuments: string[],
	provider: SupportedProvider,
	modelId:
		| SupportedAnthropicModel
		| SupportedGeminiModel
		| SupportedOpenAIModel,
) {
	// TODO: periodically update the system prompt to include new features and changes in the target format's documentation (use github actions?)
	const systemPrompt = `You are a context file conversion assistant specialized in converting context files between different AI coding tool formats.

Core responsibilities:
- Preserve all relevant settings and context instructions
- Follow target format's syntax and conventions exactly
- Adapt format-specific features appropriately
- Maintain functional intent across conversions
- Output appropriate file path(s) and content(s) based on target format's documentation requirements
- When converting multiple files, intelligently merge or organize them according to the target format's conventions

FILE NAMING GUIDELINES:
- For claude-code target format: Use CLAUDE.md for project memory (located in project root)
- For codex target format: Use AGENTS.md for custom instructions (located in project root, merged with global ~/.codex/AGENTS.md)
- For cursor target format: Use .mdc files within .cursor/rules/ directory structure (flexible naming within this structure)
- For copilot target format: Use .github/copilot-instructions.md in repository root for repository custom instructions
- For gemini-cli target format: Use GEMINI.md (default context filename, configurable via contextFileName setting)
- Consider the target format's conventions while allowing for project-specific variations when appropriate`;

	const userMessage = `Convert ${contents.length} source context file(s) to the target format.

TARGET FORMAT: You are converting TO the target format. Pay special attention to the target format's file naming conventions and structure requirements.

Source context file documentation:
<source_docs>
${sourceContextDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</source_docs>

Target context file documentation:
<target_docs>
${targetContextDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</target_docs>

Source context files:
${contents
	.map(
		(file, index) => `<source_file_${index + 1} path="${file.path}">
${file.content}
</source_file_${index + 1}>`,
	)
	.join("\n\n")}

IMPORTANT: Follow the target format's typical file naming conventions and directory structures as specified in the target documentation, while considering project-specific needs.`;

	const model = createModel(provider, modelId);
	const { object, usage } = await generateObject({
		model,
		system: systemPrompt,
		messages: [{ role: "user", content: userMessage }],
		temperature: 0.2, // TODO: make this configurable
		schema: z.object({
			files: z.array(
				z.object({
					path: z.string(),
					content: z.string(),
				}),
			),
		}),
	});

	return { files: object.files, usage };
}

function createModel(
	provider: SupportedProvider,
	modelId:
		| SupportedAnthropicModel
		| SupportedGeminiModel
		| SupportedOpenAIModel,
) {
	if (provider === "openai") {
		return openai(modelId);
	} else if (provider === "gemini") {
		return google(modelId);
	} else if (provider === "anthropic") {
		return anthropic(modelId);
	}
	throw new Error(`Unsupported provider: ${provider}`);
}

export async function confirm(message: string) {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await new Promise<string>((resolve) => {
		rl.question(message, resolve);
	});
	rl.close();

	return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}
