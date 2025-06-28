import { createInterface } from "node:readline";
import { anthropic } from "@ai-sdk/anthropic";
import type { AnthropicMessagesModelId } from "@ai-sdk/anthropic/internal";
import { openai } from "@ai-sdk/openai";
import type { OpenAIChatModelId } from "@ai-sdk/openai/internal";
import { generateObject } from "ai";
import type { Ora } from "ora";
import { z } from "zod";

import type { SupportedFormat, SupportedProvider } from "./constants";
import { DOC_URL, PROVIDER_NAME, TOOL_NAME } from "./constants";

export async function convertContext(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
	modelId: OpenAIChatModelId | AnthropicMessagesModelId,
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
		content,
		sourceContextDocuments,
		targetContextDocuments,
		provider,
		modelId,
	);
	spinner.succeed("Context files converted successfully");

	return generatedContext;
}

async function generateContext(
	content: string,
	sourceContextDocuments: string[],
	targetContextDocuments: string[],
	provider: SupportedProvider,
	modelId: OpenAIChatModelId | AnthropicMessagesModelId,
) {
	const prompt = `
You are a context file conversion assistant. Your task is to convert a source context file to a target context file format.

You will be provided with:
- Documentation for the source context file format
- Documentation for the target context file format  
- The content of the source context file

Please convert the source context file to the target format based on the documentation provided. Ensure that:
- All relevant settings and context instructions are preserved
- The output follows the target format's syntax and conventions
- Any format-specific features are properly adapted
- The converted context file maintains the same functional intent
- You must output both the appropriate file path(s) and the file content(s) for the target format

The conversion may result in one or multiple files depending on the target format's requirements. However, prefer keeping everything in a single file unless the target format requires file separation. For each file, provide:
- The correct file path (including filename and extension) where the file should be placed
- The complete file content in the target format

Source context file documentation:
<source_docs>
${sourceContextDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</source_docs>

Target context file documentation:
<target_docs>
${targetContextDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</target_docs>

Source context file content:
<source_context>
${content}
</source_context>
`;

	const model = provider === "openai" ? openai(modelId) : anthropic(modelId);

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
