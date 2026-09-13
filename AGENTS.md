# AGENTS.md — create-gitignore

> Agent instructions for the `create-gitignore` repository.

---

## Project Overview

`create-gitignore` is a Node.js CLI tool that fetches `.gitignore` templates from the official [github/gitignore](https://github.com/github/gitignore) repository and generates them locally. It ensures a base level of protection by appending `*.log` to every generated file if not already present.

---

## Useful Commands

| Command | Description |
|---|---|
| `npm run compile` | Transpile `src/` to `lib/` using Babel |
| `npm run dev` | Watch `src/` and auto-recompile on changes |
| `npm start` | Execute the compiled CLI (`lib/index.js`) |
| `npm test` | Run Mocha tests against compiled code in `lib/` |
| `npm run prepublish` | Build before publishing (runs compile) |

### Testing

```sh
npm test
```

Tests use `mocha` with `babel-register` compiler and run against the **compiled output** in `lib/`, not `src/`. Always run `npm run compile` before testing after making source changes.

---

## Technologies

| Category | Technology |
|---|---|
| **Runtime** | Node.js |
| **Transpiler** | Babel 6 (presets: `es2015`, `stage-2`) |
| **HTTP Client** | `axios` — fetches templates from GitHub |
| **CLI Prompts** | `inquirer` — interactive overwrite confirmation |
| **Terminal Styling** | `chalk` — colored output |
| **Argument Parsing** | `minimist` — CLI argument handling |
| **Testing** | `mocha` + `chai` |
| **Package Manager** | npm (bun lock file present for dependency reference) |

### Key Dependencies (from `package.json`)

- **Dependencies:** `axios`, `chalk`, `inquirer`, `minimist`
- **DevDependencies:** `babel-cli`, `babel-preset-es2015`, `babel-preset-stage-2`, `chai`
- **Trusted Dependencies:** `core-js`, `spawn-sync`

---

## Project Structure

```
src/          Source code (ES2015+ modules — single file: index.js)
lib/          Compiled output (Babel transpiled — entry point for CLI)
test/         Unit tests (single file: index.js)
Plans/        Design/planning documents
.babelrc      Babel configuration (es2015 + stage-2 presets)
.gitignore    Project's own .gitignore
.npmignore    Excludes src/ from npm package (only lib/ shipped)
package.json  Project metadata, scripts, dependencies
```

### Important Paths

- **Source:** `src/index.js` — all logic lives here; edit this, never `lib/`.
- **Compiled entry:** `lib/index.js` — `bin` and `main` in `package.json` both point here.
- **Test entry:** `test/index.js` — requires `../lib/index` (tests compiled output).

---

## Best Practices

### Source Control

- **Always edit files in `src/`**, never directly in `lib/`. `lib/` is generated output.
- Run `npm run compile` (or `npm run dev` for watch mode) after any source change before testing or distributing.
- `.npmignore` excludes `src/` — only the compiled `lib/` is published to npm.

### Compilation Workflow

```
src/index.js (ES2015+ imports) → Babel (es2015, stage-2) → lib/index.js (CommonJS)
```

- The `.babelrc` config uses presets `es2015` and `stage-2` with no plugins.
- `npm run compile` runs `babel -d lib/ src/` (one-time build).
- `npm run dev` runs `babel -d lib/ src/ --copy-files --watch` (watch mode).
- The `prepublish` script ensures compilation runs before `npm publish`.

### Testing

- Tests run against `lib/` (compiled output), not `src/`.
- Always compile before running tests: `npm run compile && npm test`.
- Tests verify the `ensureLogPattern` utility — the project's key custom feature.
- Test framework: Mocha with `chai` assertions, using `babel-register` compiler.

### CLI Usage Notes

- Template names are **case-sensitive** (e.g., `Node`, not `node`). This is a known limitation with a TODO to remove case sensitivity.
- `create-gitignore list` fetches and displays all available templates from GitHub.
- `create-gitignore <template>` fetches the template and creates `.gitignore` in the current directory, prompting for overwrite if the file exists.

---

## Guidelines

### Architecture

- **Single-source architecture:** All application logic is in `src/index.js` (~120 lines). There are no separate modules to coordinate.
- **Custom feature — `ensureLogPattern`:** Every generated `.gitignore` is post-processed to include `*.log` for basic log protection. This function is exported for testability.
- **Template fetching:** Two-tier lookup — tries the root `github/gitignore` repo first, falls back to the `Global/` subdirectory on 404.

### Code Patterns

- Source uses ES2015+ `import`/`export` syntax; compiled output uses CommonJS `require`/`exports`.
- The `ensureLogPattern` function is a pure function (input string → output string) — easy to test in isolation.
- The CLI entry point is guarded by `if (require.main === module)` to allow importing functions in tests.

### Feature Development

- Any new functionality should be added to `src/index.js` and exported if it needs test coverage.
- After adding/changing code in `src/`, compile (`npm run compile`) before running tests.
- Follow the existing pattern: pure utility functions are exported and tested; CLI-specific logic stays in the `require.main === module` block.

### Roadmap Items

- Remove case sensitivity for template names (noted in both `README.md` and `GEMINI.md`).

---

## Environment Notes

- **Platform:** Windows (Win32) — use PowerShell-compatible shell commands.
- **Package Manager:** Use `bun` (>=1.3.0) for Node.js tasks where applicable. A `bun.lock` file is present for dependency reference.
- **No CLAUDE.md or copilot-instructions.md** exist in this repository; this file serves as the primary agent instruction set.