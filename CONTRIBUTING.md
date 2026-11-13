# Contributing to @ipsadt/tg-widgets

Thank you for your interest in contributing to `@ipsadt/tg-widgets`! We welcome bug reports, feature suggestions, UI component additions, and pull requests.

---

## 🛠️ Local Development Setup

This project uses [Bun](https://bun.sh) and [TypeScript](https://www.typescriptlang.org).

### 1. Clone & Install

```bash
git clone https://github.com/SSA-IPSaDT/tg-widgets.git
cd tg-widgets
bun install
```

### 2. Available Scripts

```bash
# Typecheck
bun run check

# Code formatting
bun run format:check   # Check formatting
bun run format         # Auto-format

# Run test suite
bun run test

# Validate 4096B Telegram deflate limit
bun run check:compression

# Build bundle and declaration files to dist/
bun run build
```

---

## 📐 Guidelines for UI Components

1. **Zero Runtime Virtual DOM**:
    - Every component must return an HTML string compiled via JSX `h()`.
    - Never introduce React or DOM manipulation dependencies into component rendering.
2. **Telegram Theme Variables**:
    - Components MUST NOT hardcode themes or application-specific branding.
    - Rely strictly on `--tg-theme-*` CSS variables (`--tg-theme-bg-color`, `--tg-theme-button-color`, etc.).
3. **Payload Compression Constraints**:
    - Keep generated HTML and inline styles minimal and concise.
    - Telegram enforces a strict 4096-byte deflate level 9 payload limit.
4. **Architectural & File Size Constraints**:
    - Every file in `src/`, `examples/`, and `scripts/` must strictly not exceed 200 lines of code.
    - Use strict TypeScript typing without `any`.
    - Use arrow functions: `export const MyComponent = (props: MyComponentProps): string => ...`.

---

## 🚀 Pull Request Checklist

Before submitting a pull request, please verify:

- [ ] `bun run build` runs and compiles cleanly without errors.
- [ ] `bun run check` reports zero TypeScript errors.
- [ ] `bun run format:check` reports clean code style.
- [ ] `bun run test` passes all unit and integration tests.
- [ ] `bun run check:compression` confirms all screens fit within 4096 bytes.
- [ ] No file exceeds 200 lines of code.
- [ ] Any new component or feature is covered by unit tests in `tests/`.

---

## 📄 License

By contributing to this repository, you agree that your contributions will be licensed under the [MIT License](LICENSE).
