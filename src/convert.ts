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
	const prompt = `
You are a context file conversion assistant. Your task is to convert source context files to a target context file format.

You will be provided with:
- Documentation for the source context file format
- Documentation for the target context file format  
- The content of ${contents.length} source context file(s)

Please convert the source context files to the target format based on the documentation provided. Ensure that:
- All relevant settings and context instructions are preserved
- The output follows the target format's syntax and conventions
- Any format-specific features are properly adapted
- The converted context files maintain the same functional intent
- Output appropriate file path(s) and content(s) based on the target format's documentation requirements
- When converting multiple files, intelligently merge or organize them according to the target format's conventions

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
`;

	const model = createModel(provider, modelId);
	const { object, usage } = await generateObject({
		model,
		schema: z.object({
			files: z.array(
				z.object({
					path: z.string(),
					content: z.string(),
				}),
			),
		}),
		prompt,
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
