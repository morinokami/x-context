#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import * as z from "zod/v4";

import {
	packageVersion,
	supportedFormats,
	supportedProviders,
} from "./constants";
import { convertConfig } from "./convert";
import { validateEnvironmentVariables } from "./utils";

const CliOptionsSchema = z.object({
	from: z.enum(supportedFormats, {
		message: `--from must be one of: ${supportedFormats.join(", ")}`,
	}),
	to: z.enum(supportedFormats, {
		message: `--to must be one of: ${supportedFormats.join(", ")}`,
	}),
	provider: z.enum(supportedProviders, {
		message: `--provider must be one of: ${supportedProviders.join(", ")}`,
	}),
});

const program = new Command();

program
	.name("x-context")
	.description(
		"Convert AI coding tool configuration files between different formats",
	)
	.version(packageVersion)
	.requiredOption(
		"--from <format>",
		`source format (${supportedFormats.join(", ")})`,
	)
	.requiredOption(
		"--to <format>",
		`target format (${supportedFormats.join(", ")})`,
	)
	.requiredOption(
		"--provider <provider>",
		`AI provider to use for generation (${supportedProviders.join(", ")})`,
	)
	.argument("<file>", "configuration file to convert")
	.action(
		(file: string, options: { from: string; to: string; provider: string }) => {
			const validationResult = CliOptionsSchema.safeParse(options);
			if (!validationResult.success) {
				const errors = validationResult.error.issues.map(
					(issue) => issue.message,
				);
				console.error(`Error: ${errors.join(", ")}`);
				process.exit(1);
			}

			const { from, to, provider } = validationResult.data;

			validateEnvironmentVariables(provider);

			const filePath = resolve(file);

			try {
				const content = readFileSync(filePath, "utf-8");
				const converted = convertConfig(content, from, to, provider);

				// TODO: Write to new file with appropriate path
				const outputPath = "converted.txt";
				writeFileSync(outputPath, converted);

				console.log(`Converted ${from} config to ${to} format: ${outputPath}`);
			} catch (error) {
				console.error(
					`Error: ${error instanceof Error ? error.message : String(error)}`,
				);
				process.exit(1);
			}
		},
	);

program.parse();
