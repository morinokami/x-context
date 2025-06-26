#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { type SupportedFormat, supportedFormats } from "./constants";
import { convertConfig } from "./convert";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

const program = new Command();

program
	.name("x-context")
	.description(
		"Convert AI coding tool configuration files between different formats",
	)
	.version(packageJson.version)
	.requiredOption(
		"--from <format>",
		`source format (${supportedFormats.join(", ")})`,
	)
	.requiredOption(
		"--to <format>",
		`target format (${supportedFormats.join(", ")})`,
	)
	.argument("<file>", "configuration file to convert")
	.action((file: string, options: { from: string; to: string }) => {
		if (!supportedFormats.includes(options.from as SupportedFormat)) {
			console.error(
				`Error: --from must be one of: ${supportedFormats.join(", ")}`,
			);
			process.exit(1);
		}

		if (!supportedFormats.includes(options.to as SupportedFormat)) {
			console.error(
				`Error: --to must be one of: ${supportedFormats.join(", ")}`,
			);
			process.exit(1);
		}

		const from = options.from as SupportedFormat;
		const to = options.to as SupportedFormat;
		const filePath = resolve(file);

		try {
			const content = readFileSync(filePath, "utf-8");
			const converted = convertConfig(content, from, to);

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
	});

program.parse();
