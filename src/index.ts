#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Command } from "commander";
import ora from "ora";
import * as z from "zod/v4";

import {
	DEFAULT_MODEL,
	PROVIDER_NAME,
	packageVersion,
	SUPPORTED_FORMATS,
	SUPPORTED_MODEL,
	SUPPORTED_PROVIDERS,
	type SupportedAnthropicModel,
	type SupportedGeminiModel,
	type SupportedOpenAIModel,
	type SupportedProvider,
	TOOL_NAME,
} from "./constants";
import { confirm, convertContext } from "./convert";

function findProviderForModel(model: string) {
	for (const [provider, models] of Object.entries(SUPPORTED_MODEL)) {
		if (models.includes(model as never)) {
			return provider as SupportedProvider;
		}
	}
	return null;
}

const CliOptionsSchema = z.object({
	from: z.enum(SUPPORTED_FORMATS, {
		message: `--from must be one of: ${SUPPORTED_FORMATS.join(", ")}`,
	}),
	to: z.enum(SUPPORTED_FORMATS, {
		message: `--to must be one of: ${SUPPORTED_FORMATS.join(", ")}`,
	}),
	provider: z
		.enum(SUPPORTED_PROVIDERS, {
			message: `--provider must be one of: ${SUPPORTED_PROVIDERS.join(", ")}`,
		})
		.optional(),
	model: z
		.enum(Object.values(SUPPORTED_MODEL).flat(), {
			message:
				"Invalid model. See https://github.com/morinokami/x-context for supported models",
		})
		.optional(),
});

const spinner = ora();
const program = new Command();

program
	.name("x-context")
	.description("Convert AI coding tool context files between different formats")
	.version(packageVersion)
	.requiredOption(
		"--from <format>",
		`source format (${SUPPORTED_FORMATS.join(", ")})`,
	)
	.requiredOption(
		"--to <format>",
		`target format (${SUPPORTED_FORMATS.join(", ")})`,
	)
	.option(
		"--provider <provider>",
		`AI model provider to use for generation (${SUPPORTED_PROVIDERS.join(", ")})`,
	)
	.option(
		"--model <model>",
		`AI model to use for generation (See https://github.com/morinokami/x-context for the full list)`,
	)
	.argument("<files...>", "context files to convert")
	.action(
		async (
			files: string[],
			options: { from: string; to: string; provider?: string; model?: string },
		) => {
			const validationResult = CliOptionsSchema.safeParse(options);
			if (!validationResult.success) {
				const errors = validationResult.error.issues.map(
					(issue) => issue.message,
				);
				console.error(`Error: ${errors.join(", ")}`);
				process.exit(1);
			}

			const {
				from,
				to,
				provider: specifiedProvider,
				model: specifiedModel,
			} = validationResult.data;

			// Check if from and to formats are the same
			if (from === to) {
				console.error(
					`Error: Source and target formats are the same (${from}). No conversion needed`,
				);
				process.exit(1);
			}

			// Determine the actual provider and model to use
			let provider: SupportedProvider;
			let modelId:
				| SupportedAnthropicModel
				| SupportedGeminiModel
				| SupportedOpenAIModel;
			if (specifiedModel) {
				// Model is provided, find its provider
				const modelProvider = findProviderForModel(specifiedModel);
				if (!modelProvider) {
					console.error(
						`Error: Model ${specifiedModel} is not supported. See https://github.com/morinokami/x-context for supported models`,
					);
					process.exit(1);
				}

				if (specifiedProvider && specifiedProvider !== modelProvider) {
					console.error(
						`Error: Model ${specifiedModel} belongs to provider ${modelProvider} but ${specifiedProvider} was specified`,
					);
					process.exit(1);
				}

				provider = modelProvider;
				modelId = specifiedModel;
			} else if (specifiedProvider) {
				// Provider is provided but no model, use default model
				provider = specifiedProvider;
				modelId = DEFAULT_MODEL[specifiedProvider];
			} else {
				console.error("Error: Either provider or model must be specified");
				process.exit(1);
			}

			const filePaths = files.map((file) => resolve(file));
			try {
				spinner.start(`Reading ${filePaths.length} source context file(s)...`);
				const contents = filePaths.map((filePath) => {
					try {
						return {
							path: filePath,
							content: readFileSync(filePath, "utf-8"),
						};
					} catch (error) {
						throw new Error(
							`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
						);
					}
				});
				spinner.succeed("Source context files read successfully");

				const converted = await convertContext(
					contents,
					from,
					to,
					provider,
					modelId,
					spinner,
				);

				console.log(`\n📁 Files to be written:`);
				for (const file of converted.files) {
					console.log(`- ${file.path}`);
				}
				const ok = await confirm("\nProceed with writing these files? (y/N): ");
				if (!ok) {
					console.log("Operation cancelled.");
					process.exit(0);
				}

				spinner.start("Writing converted files...");
				for (const file of converted.files) {
					const fileDir = dirname(file.path);
					mkdirSync(fileDir, { recursive: true });
					writeFileSync(file.path, file.content);
				}
				spinner.succeed("Files written successfully");

				console.log(
					`\n💡 Converted ${filePaths.length} ${TOOL_NAME[from]} context file(s) to ${TOOL_NAME[to]} format!`,
				);
				console.log(`🤖 Model: ${PROVIDER_NAME[provider]} (${modelId})`);
				console.log(`💬 Total tokens: ${converted.usage.totalTokens}`);
			} catch (error) {
				spinner.fail(
					`Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
				);
				process.exit(1);
			}
		},
	);

program.parse();
