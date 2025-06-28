// Hacky way to extract the list of models from the AI SDK packages

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as ts from "typescript";

interface ModelDefinition {
	openai: string[];
	anthropic: string[];
}

function extractUnionTypes(fileName: string, typeName: string): string[] {
	const content = readFileSync(fileName, "utf-8");
	const sourceFile = ts.createSourceFile(
		fileName,
		content,
		ts.ScriptTarget.Latest,
		true,
	);

	const models: string[] = [];

	function visit(node: ts.Node): void {
		if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
			if (ts.isUnionTypeNode(node.type)) {
				for (const type of node.type.types) {
					if (ts.isLiteralTypeNode(type)) {
						if (ts.isStringLiteral(type.literal)) {
							models.push(type.literal.text);
						}
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);
	return models;
}

async function findAISDKPath(packageName: string): Promise<string> {
	// Resolve the actual path of pnpm symlinks
	const { realpathSync } = await import("node:fs");
	const symlinkPath = resolve(`node_modules/@ai-sdk/${packageName}`);
	const realPath = realpathSync(symlinkPath);
	return resolve(`${realPath}/internal/dist/index.d.ts`);
}

function updateConstantsFile(models: ModelDefinition): void {
	const constantsPath = resolve("src/constants.ts");
	let content = readFileSync(constantsPath, "utf-8");

	// Replace the SUPPORTED_MODELS definition
	const openaiModelsArray = models.openai
		.map((model) => `\t\t"${model}"`)
		.join(",\n");
	const anthropicModelsArray = models.anthropic
		.map((model) => `\t\t"${model}"`)
		.join(",\n");

	const newSupportedModels = `export const SUPPORTED_MODELS: {
	openai: OpenAIChatModelId[];
	anthropic: AnthropicMessagesModelId[];
} = {
	openai: [
${openaiModelsArray},
	],
	anthropic: [
${anthropicModelsArray},
	],
} as const;`;

	// Replace existing SUPPORTED_MODELS using regex
	const supportedModelsRegex =
		/export const SUPPORTED_MODELS: \{[\s\S]*?\} as const;/;
	content = content.replace(supportedModelsRegex, newSupportedModels);

	writeFileSync(constantsPath, content);
}

async function main(): Promise<void> {
	try {
		// Extract OpenAI models
		const openaiPath = await findAISDKPath("openai");
		const openaiModels = extractUnionTypes(openaiPath, "OpenAIChatModelId");

		// Extract Anthropic models
		const anthropicPath = await findAISDKPath("anthropic");
		const anthropicModels = extractUnionTypes(
			anthropicPath,
			"AnthropicMessagesModelId",
		);

		// Update constants.ts
		const models: ModelDefinition = {
			openai: openaiModels,
			anthropic: anthropicModels,
		};

		updateConstantsFile(models);
		console.log("Updated src/constants.ts with extracted models");
	} catch (error) {
		console.error("Error extracting models:", error);
		process.exit(1);
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	main();
}
