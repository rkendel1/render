import { defineSchema } from "@json-render/core";

/**
 * The schema for @json-render/react-native
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
      // Layout patterns
      "FIXED BOTTOM BAR PATTERN: When building a screen with a fixed header and/or fixed bottom tab bar, the outermost Column must have flex:1 so it fills the SafeArea. The scrollable content area must also have flex:1. Structure: SafeArea > Column(flex:1, gap:0) > [header, Container(flex:1) > [ScrollContainer(...)], bottom-tabs]. Both the outer Column AND the content Container need flex:1.",
      "NEVER place a bottom tab bar or fixed footer inside a ScrollContainer. It must be a sibling AFTER the flex:1 container that holds the ScrollContainer.",

      // Element integrity
      "CRITICAL INTEGRITY CHECK: Before outputting ANY element that references children, you MUST have already output (or will output) each child as its own element. If an element has children: ['a', 'b'], then elements 'a' and 'b' MUST exist. A missing child element causes that entire branch of the UI to be invisible.",
      "SELF-CHECK: After generating all elements, mentally walk the tree from root. Every key in every children array must resolve to a defined element. If you find a gap, output the missing element immediately.",
      'When building repeating content backed by a state array (e.g. todos, posts, cart items), use the "repeat" field on the container element. Example: { "type": "Column", "props": { "gap": 8 }, "repeat": { "path": "/todos", "key": "id" }, "children": ["todo-item"] }. Inside repeated children, use "$item/field" for per-item state paths and "$index" for the current array index. Do NOT hardcode individual elements for each array item.',

      // Visible field placement
      'CRITICAL: The "visible" field goes on the ELEMENT object, NOT inside "props". Correct: {"type":"Column","props":{"gap":8},"visible":{"eq":[{"path":"/activeTab"},"home"]},"children":[...]}. WRONG: {"type":"Column","props":{"gap":8,"visible":{...}},"children":[...]}.',

      // Tab navigation pattern
      "TAB NAVIGATION PATTERN: When building a UI with multiple tabs, use Pressable + setState action + visible conditions to make tabs functional.",
      'Each tab button should be a Pressable wrapping its icon/label children, with action "setState" and actionParams { "path": "/activeTab", "value": "tabName" }.',
      'Each tab\'s content section should have a visible condition: { "eq": [{ "path": "/activeTab" }, "tabName"] }.',
      "The first tab's content should NOT have a visible condition (so it shows by default when no tab is selected yet). All other tabs MUST have a visible condition.",

      // Tab active state highlighting (using dynamic props)
      "TAB ACTIVE STYLING: Use $cond dynamic props on the Icon inside each tab Pressable so a single Icon changes appearance based on the active tab.",
      '  - For the icon name: { "$cond": { "eq": [{ "path": "/activeTab" }, "thisTabName"] }, "$then": "home", "$else": "home-outline" }',
      '  - For the icon color: { "$cond": { "eq": [{ "path": "/activeTab" }, "thisTabName"] }, "$then": "#007AFF", "$else": "#8E8E93" }',
      "  - For labels, use $cond on the color prop similarly.",
      '  - For the FIRST/DEFAULT tab, use { "$cond": { "or": [{ "eq": [{ "path": "/activeTab" }, "thisTabName"] }, { "not": { "path": "/activeTab" } }] }, "$then": "#007AFF", "$else": "#8E8E93" } so it appears active before any tab is tapped.',

      // Push/pop screen navigation (all screens in one spec)
      'SCREEN NAVIGATION: Use Pressable with action "push" and actionParams { "screen": "screenName" } to navigate to a new screen. Use action "pop" to go back. All screens must be defined in the SAME spec.',
      'Each screen section uses a visible condition on /currentScreen: { "eq": [{ "path": "/currentScreen" }, "screenName"] }. The default/home screen should also be visible when /currentScreen is not set: { "or": [{ "eq": [{ "path": "/currentScreen" }, "home"] }, { "not": { "path": "/currentScreen" } }] }.',
      "push automatically maintains a /navStack in the state model so pop always returns to the previous screen.",
      'Include a back button on pushed screens using action "pop". Example: Pressable(action:"pop") > Row > Icon(name:"chevron-back") + Label(text:"Back").',
      "Use push/pop for drill-down flows: tapping a list item to see details, opening a profile, etc. Use setState + visible conditions for tab switching within a screen.",
      'Example: A list screen with items that push to detail: Pressable(action:"push", actionParams:{screen:"repo-detail"}) wrapping each list item card. The detail screen section has visible:{"eq":[{"path":"/currentScreen"},"repo-detail"]} and contains a back button with action:"pop".',
    ],
  },
);

/**
 * Type for the React Native schema
 */
export type ReactNativeSchema = typeof schema;

/**
 * Infer the spec type from a catalog
 */
export type ReactNativeSpec<TCatalog> = typeof schema extends {
  createCatalog: (catalog: TCatalog) => { _specType: infer S };
}
  ? S
  : never;

// Backward compatibility aliases
/** @deprecated Use `schema` instead */
export const elementTreeSchema = schema;
/** @deprecated Use `ReactNativeSchema` instead */
export type ElementTreeSchema = ReactNativeSchema;
/** @deprecated Use `ReactNativeSpec` instead */
export type ElementTreeSpec<T> = ReactNativeSpec<T>;
