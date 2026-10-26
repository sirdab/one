# Sirdab One

This repository owns the shared design system. Product repositories consume releases.

- Start messages with [AI TEAM]. Never use the em dash character.
- Use pnpm 11 and Node 24. Run targets with pnpm nx.
- packages/one is the only public npm package. apps/site owns public documentation and the lookbook.
- Preserve the ported component behavior, semantic foundation tokens, dark mode, Arabic and RTL support.
- Read packages/one/TOKENS.md and COLORS.md before changing visual values. Use existing house icons.
- Keep UI components independent of Next.js and product services. Interactive module directives must survive compilation.
- Tests belong in tests/ beside their subject. Prefer behavior and consumer tests over implementation mirrors.
- Never require consumers to copy assets, configure Tailwind scanning or transpile package TypeScript.
- Test tarball installs in isolated Next.js and Vite apps before publishing. No workspace aliases or dependency overrides may hide packaging issues.
- Preserve third-party license notices. Main project license is MIT.
- Do not publish npm releases or merge PRs without explicit approval. Open implementation PRs ready for review.
