// import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { SupportedFormat, SupportedProvider } from "./constants";
import { configDocuments } from "./constants";

export async function convertConfig(
	content: string,
	from: SupportedFormat,
	to: SupportedFormat,
	provider: SupportedProvider,
) {
	// TODO: convert html to markdown if needed
	const sourceConfigDocuments = await Promise.all(
		configDocuments[from].map((url) => fetch(url).then((res) => res.text())),
	);
	const targetConfigDocuments = await Promise.all(
		configDocuments[to].map((url) => fetch(url).then((res) => res.text())),
	);

	const generatedConfig = await generateConfig(
		content,
		sourceConfigDocuments,
		targetConfigDocuments,
		provider,
	);

	return generatedConfig;
}

async function generateConfig(
	content: string,
	sourceConfigDocuments: string[],
	targetConfigDocuments: string[],
	provider: SupportedProvider,
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

	if (provider === "openai") {
		const openai = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY,
		});
		const GeneratedConfigSchema = z.object({
			files: z.array(
				z.object({
					path: z.string(),
					content: z.string(),
				}),
			),
		});

		const response = await openai.responses.parse({
			model: "gpt-4.1", // TODO: make this configurable
			input: prompt,
			text: {
				format: zodTextFormat(GeneratedConfigSchema, "GeneratedConfig"),
			},
		});

		if (!response.output_parsed) {
			throw new Error("Failed to generate config");
		}

		return response.output_parsed.files;
	}

	// TODO: implement anthropic
	throw new Error("Not implemented");
}
