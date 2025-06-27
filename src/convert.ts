import { anthropic } from "@ai-sdk/anthropic";
import type { AnthropicMessagesModelId } from "@ai-sdk/anthropic/internal";
import { openai } from "@ai-sdk/openai";
import type { OpenAIChatModelId } from "@ai-sdk/openai/internal";
import { generateObject } from "ai";
import type { Ora } from "ora";
import { z } from "zod";
import type { SupportedFormat, SupportedProvider } from "./constants";
import { DOC_URL, PROVIDER_NAME, TOOL_NAME } from "./constants";

export async function convertConfig(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
	modelId: OpenAIChatModelId | AnthropicMessagesModelId,
	spinner: Ora,
) {
	spinner.text = `Fetching ${from} documentation...`;
	const sourceConfigDocuments = await Promise.all(
		DOC_URL[from].map((url) => fetch(url).then((res) => res.text())),
	);

	spinner.text = `Fetching ${to} documentation...`;
	const targetConfigDocuments = await Promise.all(
		DOC_URL[to].map((url) => fetch(url).then((res) => res.text())),
	);
	spinner.succeed("Configuration documentation fetched successfully");

	spinner.start(
		`Generating ${TOOL_NAME[to]} configuration using ${PROVIDER_NAME[provider]} ${modelId}...`,
	);
	const generatedConfig = await generateConfig(
		content,
		sourceConfigDocuments,
		targetConfigDocuments,
		provider,
		modelId,
	);
	spinner.succeed("Configuration converted successfully");

	return generatedConfig;
}

async function generateConfig(
	content: string,
	sourceConfigDocuments: string[],
	targetConfigDocuments: string[],
	provider: SupportedProvider,
	modelId: OpenAIChatModelId | AnthropicMessagesModelId,
) {
	const prompt = `
You are a configuration file conversion assistant. Your task is to convert a source configuration file to a target configuration format.

You will be provided with:
- Documentation for the source configuration format
- Documentation for the target configuration format  
- The content of the source configuration file

Please convert the source configuration file to the target format based on the documentation provided. Ensure that:
- All relevant settings and configurations are preserved
- The output follows the target format's syntax and conventions
- Any format-specific features are properly adapted
- The converted configuration maintains the same functional intent
- You must output both the appropriate file path(s) and the file content(s) for the target format

The conversion may result in one or multiple files depending on the target format's requirements. However, prefer keeping everything in a single file unless the target format requires file separation. For each file, provide:
- The correct file path (including filename and extension) where the file should be placed
- The complete file content in the target format

Source configuration documentation:
<source_docs>
${sourceConfigDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</source_docs>

Target configuration documentation:
<target_docs>
${targetConfigDocuments.map((doc) => `<content>${doc}</content>`).join("\n")}
</target_docs>

Source configuration file content:
<source_config>
${content}
</source_config>
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
