import { defineSchema } from "@json-render/core";

/**
 * The schema for @json-render/react
 *
 * Defines:
 * - Spec: A flat tree of elements with keys, types, props, and children references
 * - Catalog: Components with props schemas, and optional actions
 */
export const schema = defineSchema(
  (s) => ({
    // What the AI-generated SPEC looks like
    spec: s.object({
      /** Root element key */
      root: s.string(),
      /** Flat map of elements by key */
      elements: s.record(
        s.object({
          /** Component type from catalog */
          type: s.ref("catalog.components"),
          /** Component props */
          props: s.propsOf("catalog.components"),
          /** Child element keys (flat reference) */
          children: s.array(s.string()),
          /** Visibility condition */
          visible: s.any(),
        }),
      ),
    }),

    // What the CATALOG must provide
    catalog: s.object({
      /** Component definitions */
      components: s.map({
        /** Zod schema for component props */
        props: s.zod(),
        /** Slots for this component. Use ['default'] for children, or named slots like ['header', 'footer'] */
        slots: s.array(s.string()),
        /** Description for AI generation hints */
        description: s.string(),
      }),
      /** Action definitions (optional) */
      actions: s.map({
        /** Zod schema for action params */
        params: s.zod(),
        /** Description for AI generation hints */
        description: s.string(),
      }),
    }),
  }),
  {
    defaultRules: [
      // Element integrity
      "CRITICAL INTEGRITY CHECK: Before outputting ANY element that references children, you MUST have already output (or will output) each child as its own element. If an element has children: ['a', 'b'], then elements 'a' and 'b' MUST exist. A missing child element causes that entire branch of the UI to be invisible.",
      "SELF-CHECK: After generating all elements, mentally walk the tree from root. Every key in every children array must resolve to a defined element. If you find a gap, output the missing element immediately.",

      // Field placement
      'CRITICAL: The "visible" field goes on the ELEMENT object, NOT inside "props". Correct: {"type":"Stack","props":{"gap":"md"},"visible":{"eq":[{"path":"/tab"},"home"]},"children":[...]}.',
      'CRITICAL: The "on" field goes on the ELEMENT object, NOT inside "props". Use on.press, on.change, on.submit etc. NEVER put action/actionParams inside props.',

      // State and data
      "When the user asks for a UI that displays data (e.g. blog posts, products, users), ALWAYS include a state field with realistic sample data. The state field is a top-level field on the spec (sibling of root/elements).",
      'When building repeating content backed by a state array (e.g. posts, products, items), use the "repeat" field on the container element. Example: { "type": "Grid", "props": { "columns": 3, "gap": "md" }, "repeat": { "path": "/posts", "key": "id" }, "children": ["post-card"] }. Inside repeated children, use "$item/field" for per-item state paths and "$index" for the current array index. Do NOT hardcode individual elements for each array item.',

      // Design quality
      "Design with visual hierarchy: use Cards to group content, Headings for section titles, proper spacing with Stack gaps, and Badges/colors for status indicators.",
      "For data-rich UIs, use Grid for multi-column layouts (2-3 columns for cards/posts). For forms and single-column content, use Stack with direction:vertical.",
      "Always include realistic, professional-looking sample data. For blogs include 3-4 posts with varied titles, authors, dates, categories. For products include names, prices, images. Never leave data empty.",
    ],
  },
);

/**
 * Type for the React schema
 */
export type ReactSchema = typeof schema;

/**
 * Infer the spec type from a catalog
 */
export type ReactSpec<TCatalog> = typeof schema extends {
  createCatalog: (catalog: TCatalog) => { _specType: infer S };
}
  ? S
  : never;

// Backward compatibility aliases
/** @deprecated Use `schema` instead */
export const elementTreeSchema = schema;
/** @deprecated Use `ReactSchema` instead */
export type ElementTreeSchema = ReactSchema;
/** @deprecated Use `ReactSpec` instead */
export type ElementTreeSpec<T> = ReactSpec<T>;
