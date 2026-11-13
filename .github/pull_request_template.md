## 📋 Summary

<!-- Briefly describe the purpose of this Pull Request and what changes it introduces. -->

## 🔗 Related Issues

<!-- Closes #123, Fixes #456, or Refs #789 -->

## 🛠️ Type of Change

- [ ] 🚀 New feature (non-breaking change which adds functionality)
- [ ] 🧩 New UI component primitive
- [ ] 🐛 Bug fix (non-breaking change fixing an issue)
- [ ] ⚡ Performance optimization (payload size reduction, speed improvements)
- [ ] 📝 Documentation update
- [ ] 🧪 Tests / CI improvement
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)

## 📐 Payload & Performance Impact

<!-- If adding or modifying UI components, please report inspectWidgetSize() numbers or confirm it remains compact. -->

- [ ] Verified that changes do not introduce bulky inline CSS or violate Telegram's `deflate level 9 <= 4096B` ceiling.

## ✅ Checklist

Before submitting your PR, please verify the following:

- [ ] My code adheres to the project's coding standards (arrow functions, TypeScript strict mode, no `any`).
- [ ] I have run `bun run check` and there are 0 TypeScript compilation errors.
- [ ] I have run `bun test` and all unit/integration tests pass cleanly.
- [ ] I have run `bun run build` and both ESM and CommonJS bundles compile with `.d.ts` types.
- [ ] If I added a new component or utility, it is exported in `src/index.ts` and `mod.ts`.
- [ ] I have updated the documentation / README.md / CHANGELOG.md if necessary.
- [ ] My commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
