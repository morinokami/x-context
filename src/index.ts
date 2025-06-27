#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import ora from "ora";
import * as z from "zod/v4";

import {
	packageVersion,
	SUPPORTED_FORMATS,
	SUPPORTED_PROVIDERS,
	TOOL_NAME,
} from "./constants";
import { convertConfig } from "./convert";

const CliOptionsSchema = z.object({
	from: z.enum(SUPPORTED_FORMATS, {
		message: `--from must be one of: ${SUPPORTED_FORMATS.join(", ")}`,
	}),
	to: z.enum(SUPPORTED_FORMATS, {
		message: `--to must be one of: ${SUPPORTED_FORMATS.join(", ")}`,
	}),
	provider: z.enum(SUPPORTED_PROVIDERS, {
		message: `--provider must be one of: ${SUPPORTED_PROVIDERS.join(", ")}`,
	}),
});

const spinner = ora();
const program = new Command();

program
	.name("x-context")
	.description(
		"Convert AI coding tool configuration files between different formats",
	)
	.version(packageVersion)
	.requiredOption(
		"--from <format>",
		`source format (${SUPPORTED_FORMATS.join(", ")})`,
	)
	.requiredOption(
		"--to <format>",
		`target format (${SUPPORTED_FORMATS.join(", ")})`,
	)
	.requiredOption(
		"--provider <provider>",
		`AI provider to use for generation (${SUPPORTED_PROVIDERS.join(", ")})`,
	)
	.argument("<file>", "configuration file to convert")
	.action(
		async (
			file: string,
			options: { from: string; to: string; provider: string },
		) => {
			const validationResult = CliOptionsSchema.safeParse(options);
			if (!validationResult.success) {
				const errors = validationResult.error.issues.map(
					(issue) => issue.message,
				);
				console.error(`Error: ${errors.join(", ")}`);
				process.exit(1);
			}

			const { from, to, provider } = validationResult.data;
			const filePath = resolve(file);

			try {
				spinner.start("Reading source configuration file...");
				const content = readFileSync(filePath, "utf-8");
				spinner.succeed("Source configuration file read successfully");

				spinner.start("Fetching configuration documentation...");
				const converted = await convertConfig(
					content,
					from,
					to,
					provider,
					spinner,
				);

				// TODO: check if the converted files can be saved to file.path
				spinner.start("Writing converted files...");
				for (const file of converted.files) {
					writeFileSync(file.path, file.content);
				}
				spinner.succeed("Files written successfully");

				console.log(
					`\n✅ Converted ${TOOL_NAME[from]} config to ${TOOL_NAME[to]} format:`,
				);
				for (const file of converted.files) {
					console.log(`   📁 ${file.path}`);
				}

				console.log(`\n💬 Total tokens: ${converted.usage.totalTokens}`);
				// TODO: display the model and provider used
			} catch (error) {
				spinner.fail(
					`Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
				);
				process.exit(1);
			}
		},
	);

program.parse();
