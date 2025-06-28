# x-context

TODO: Convert AI coding tool context files between different formats.


## Usage

You don't need to install anything, just run `npx` or `pnpm dlx` to use `x-context`:

```sh
npx x-context@latest [options] <file>
```

Specify the source (`--from`) and target (`--to`) tools, AI provider (`--provider`), and optionally a model (`--model`):

```sh
# Convert CLAUDE.md to Cursor rules using Anthropic model
npx x-context --from claude-code --to cursor --provider anthropic ./CLAUDE.md

# Convert Copilot instructions to Gemini CLI context file using Gemini model
npx x-context --from copilot --to gemini-cli --provider gemini .github/copilot-instructions.md

# Use specific model (o3)
npx x-context --from claude-code --to gemini-cli --model o3 ./CLAUDE.md
```


## Supported Tools

| Tool | Value |
| --- | --- |
| GitHub Copilot | `copilot` |
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| Gemini CLI | `gemini-cli` |


## Supported Providers

| Provider | Value | Environment Variable |
| --- | --- | --- |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |
| Gemini | `gemini` | `GOOGLE_GENERATIVE_AI_API_KEY` |
| OpenAI | `openai` | `OPENAI_API_KEY` |


## Supported Models

### Anthropic

- `claude-4-opus-20250514`
- `claude-4-sonnet-20250514` (default)
- `claude-3-7-sonnet-20250219`
- `claude-3-5-sonnet-latest`
- `claude-3-5-sonnet-20241022`
- `claude-3-5-sonnet-20240620`
- `claude-3-5-haiku-latest`
- `claude-3-5-haiku-20241022`
- `claude-3-opus-latest`
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### Gemini

- `gemini-1.5-flash`
- `gemini-1.5-flash-latest`
- `gemini-1.5-flash-001`
- `gemini-1.5-flash-002`
- `gemini-1.5-flash-8b`
- `gemini-1.5-flash-8b-latest`
- `gemini-1.5-flash-8b-001`
- `gemini-1.5-pro`
- `gemini-1.5-pro-latest`
- `gemini-1.5-pro-001`
- `gemini-1.5-pro-002`
- `gemini-2.0-flash`
- `gemini-2.0-flash-001`
- `gemini-2.0-flash-live-001`
- `gemini-2.0-flash-lite`
- `gemini-2.0-pro-exp-02-05`
- `gemini-2.0-flash-thinking-exp-01-21`
- `gemini-2.0-flash-exp`
- `gemini-2.5-pro-exp-03-25`
- `gemini-2.5-pro-preview-05-06`
- `gemini-2.5-flash-preview-04-17` (default)
- `gemini-exp-1206`
- `gemma-3-27b-it`
- `learnlm-1.5-pro-experimental`

### OpenAI

- `o1`
- `o1-2024-12-17`
- `o1-mini`
- `o1-mini-2024-09-12`
- `o1-preview`
- `o1-preview-2024-09-12`
- `o3-mini`
- `o3-mini-2025-01-31`
- `o3`
- `o3-2025-04-16`
- `o4-mini` (default)
- `o4-mini-2025-04-16`
- `gpt-4.1`
- `gpt-4.1-2025-04-14`
- `gpt-4.1-mini`
- `gpt-4.1-mini-2025-04-14`
- `gpt-4.1-nano`
- `gpt-4.1-nano-2025-04-14`
- `gpt-4o`
- `gpt-4o-2024-05-13`
- `gpt-4o-2024-08-06`
- `gpt-4o-2024-11-20`
- `gpt-4o-audio-preview`
- `gpt-4o-audio-preview-2024-10-01`
- `gpt-4o-audio-preview-2024-12-17`
- `gpt-4o-search-preview`
- `gpt-4o-search-preview-2025-03-11`
- `gpt-4o-mini-search-preview`
- `gpt-4o-mini-search-preview-2025-03-11`
- `gpt-4o-mini`
- `gpt-4o-mini-2024-07-18`
- `gpt-4-turbo`
- `gpt-4-turbo-2024-04-09`
- `gpt-4-turbo-preview`
- `gpt-4-0125-preview`
- `gpt-4-1106-preview`
- `gpt-4`
- `gpt-4-0613`
- `gpt-4.5-preview`
- `gpt-4.5-preview-2025-02-27`
- `gpt-3.5-turbo-0125`
- `gpt-3.5-turbo`
- `gpt-3.5-turbo-1106`
- `chatgpt-4o-latest`
