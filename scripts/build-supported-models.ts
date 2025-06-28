// Hacky way to extract the list of models from the AI SDK packages

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as ts from "typescript";

interface ModelDefinition {
	anthropic: string[];
	gemini: string[];
	openai: string[];
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
	const anthropicModelsArray = models.anthropic
		.map((model) => `\t\t"${model}"`)
		.join(",\n");
	const geminiModelsArray = models.gemini
		.map((model) => `\t\t"${model}"`)
		.join(",\n");
	const openaiModelsArray = models.openai
		.map((model) => `\t\t"${model}"`)
		.join(",\n");

	const newSupportedModels = `export const SUPPORTED_MODEL = {
	anthropic: [
${anthropicModelsArray},
	],
	gemini: [
${geminiModelsArray},
	],
	openai: [
${openaiModelsArray},
	],
} as const;`;

	// Replace existing SUPPORTED_MODELS using regex
	const supportedModelsRegex =
		/export const SUPPORTED_MODEL = \{[\s\S]*?\} as const;/;
	content = content.replace(supportedModelsRegex, newSupportedModels);

	writeFileSync(constantsPath, content);
}

async function main(): Promise<void> {
	try {
		// Extract Anthropic models
		const anthropicPath = await findAISDKPath("anthropic");
		const anthropicModels = extractUnionTypes(
			anthropicPath,
			"AnthropicMessagesModelId",
		);
		// TODO: @ai-sdk/google doesn't export a type for the model ids
		const geminiModels = [
			"gemini-1.5-flash",
			"gemini-1.5-flash-latest",
			"gemini-1.5-flash-001",
			"gemini-1.5-flash-002",
			"gemini-1.5-flash-8b",
			"gemini-1.5-flash-8b-latest",
			"gemini-1.5-flash-8b-001",
			"gemini-1.5-pro",
			"gemini-1.5-pro-latest",
			"gemini-1.5-pro-001",
			"gemini-1.5-pro-002",
			"gemini-2.0-flash",
			"gemini-2.0-flash-001",
			"gemini-2.0-flash-live-001",
			"gemini-2.0-flash-lite",
			"gemini-2.0-pro-exp-02-05",
			"gemini-2.0-flash-thinking-exp-01-21",
			"gemini-2.0-flash-exp",
			"gemini-2.5-pro-exp-03-25",
			"gemini-2.5-pro-preview-05-06",
			"gemini-2.5-flash-preview-04-17",
			"gemini-exp-1206",
			"gemma-3-27b-it",
			"learnlm-1.5-pro-experimental",
		];
		// Extract OpenAI models
		const openaiPath = await findAISDKPath("openai");
		const openaiModels = extractUnionTypes(openaiPath, "OpenAIChatModelId");

		// Update constants.ts
		const models: ModelDefinition = {
			anthropic: anthropicModels,
			gemini: geminiModels,
			openai: openaiModels,
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
