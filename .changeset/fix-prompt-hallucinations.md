---
"@json-render/core": patch
"@json-render/react": patch
"@json-render/react-native": patch
"@json-render/remotion": patch
"@json-render/codegen": patch
---

Fix LLM hallucinations by dynamically generating prompt examples from the user's catalog instead of hardcoding component names. Adds optional `example` field to `ComponentDefinition` with Zod schema introspection fallback. Mentions RFC 6902 in output format section.
