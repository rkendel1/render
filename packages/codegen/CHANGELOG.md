# @json-render/codegen

## 0.5.2

### Patch Changes

- 429e456: Fix LLM hallucinations by dynamically generating prompt examples from the user's catalog instead of hardcoding component names. Adds optional `example` field to `ComponentDefinition` with Zod schema introspection fallback. Mentions RFC 6902 in output format section.
- Updated dependencies [429e456]
  - @json-render/core@0.5.2

## 0.5.1

### Patch Changes

- @json-render/core@0.5.1

## 0.5.0

### Minor Changes

- 3d2d1ad: Add @json-render/react-native package, event system (emit replaces onAction), repeat/list rendering, user prompt builder, spec validation, and rename DataProvider to StateProvider.

### Patch Changes

- Updated dependencies [3d2d1ad]
  - @json-render/core@0.5.0

## 0.4.4

### Patch Changes

- dd17549: remove key/parentKey from flat specs, RFC 6902 compliance for SpecStream
- Updated dependencies [dd17549]
  - @json-render/core@0.4.4

## 0.4.3

### Patch Changes

- 61ee8e5: include remove op in system prompt
- Updated dependencies [61ee8e5]
  - @json-render/core@0.4.3

## 0.4.2

### Patch Changes

- 54bce09: add defineRegistry function
- Updated dependencies [54bce09]
  - @json-render/core@0.4.2
