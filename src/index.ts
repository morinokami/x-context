#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";
import ora from "ora";
import * as z from "zod/v4";

import {
	packageVersion,
	supportedFormats,
	supportedProviders,
} from "./constants";
import { convertConfig } from "./convert";

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
				for (const file of converted) {
					writeFileSync(file.path, file.content);
				}
				spinner.succeed("Files written successfully");

				console.log(`\n✅ Converted ${from} config to ${to} format:`);
				for (const file of converted) {
					console.log(`   📁 ${file.path}`);
				}
			} catch (error) {
				spinner.fail(
					`Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
				);
				process.exit(1);
			}
		},
	);

program.parse();
