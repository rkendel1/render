import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Web playground component catalog
 *
 * This defines the components available for AI generation in the playground.
 * Components map to implementations in lib/catalog/components.tsx
 * Actions map to handlers in lib/catalog/actions.ts
 */
export const playgroundCatalog = defineCatalog(schema, {
  components: {
    // Layout Components
    Card: {
      props: z.object({
        title: z.string().nullable(),
        description: z.string().nullable(),
        maxWidth: z.enum(["sm", "md", "lg", "full"]).nullable(),
        centered: z.boolean().nullable(),
      }),
      slots: ["default"],
      description:
        "Container card for content sections. Use for forms/content boxes, NOT for page headers.",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["none", "sm", "md", "lg"]).nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
        justify: z
          .enum(["start", "center", "end", "between", "around"])
          .nullable(),
      }),
      slots: ["default"],
      description: "Flex container for layouts",
    },

    Grid: {
      props: z.object({
        columns: z
          .union([
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
          ])
          .nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description: "Grid layout (1-6 columns)",
    },

    Divider: {
      props: z.object({}),
      description: "Horizontal separator line",
    },

    // Form Inputs
    Input: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        type: z.enum(["text", "email", "password", "number"]).nullable(),
        placeholder: z.string().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["submit", "focus", "blur"],
      description:
        "Text input field. Use statePath to bind to the state model for two-way binding.",
    },

    Textarea: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        placeholder: z.string().nullable(),
        rows: z.number().nullable(),
        statePath: z.string().nullable(),
      }),
      description:
        "Multi-line text input. Use statePath to bind to the state model.",
    },

    Select: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        options: z.array(z.string()),
        placeholder: z.string().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description:
        "Dropdown select input. Use statePath to bind to the state model.",
    },

    Checkbox: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        checked: z.boolean().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description: "Checkbox input. Use statePath to bind to the state model.",
    },

    Radio: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        options: z.array(z.string()),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description:
        "Radio button group. Use statePath to bind to the state model.",
    },

    Switch: {
      props: z.object({
        label: z.string(),
        name: z.string(),
        checked: z.boolean().nullable(),
        statePath: z.string().nullable(),
      }),
      events: ["change"],
      description:
        "Toggle switch input. Use statePath to bind to the state model.",
    },

    // Actions
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "danger"]).nullable(),
        disabled: z.boolean().nullable(),
      }),
      events: ["press"],
      description:
        "Clickable button. Bind on.press for the handler to call on press.",
    },

    Link: {
      props: z.object({
        label: z.string(),
        href: z.string(),
      }),
      events: ["press"],
      description: "Anchor link. Bind on.press for the click handler.",
    },

    // Typography
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3", "h4"]).nullable(),
      }),
      description: "Heading text (h1-h4)",
    },

    Text: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["body", "caption", "muted"]).nullable(),
      }),
      description: "Paragraph text",
    },

    // Data Display
    Image: {
      props: z.object({
        alt: z.string(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      }),
      description: "Placeholder image (displays alt text in a styled box)",
    },

    Avatar: {
      props: z.object({
        src: z.string().nullable(),
        name: z.string(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description: "User avatar with fallback initials",
    },

    Badge: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["default", "success", "warning", "danger"]).nullable(),
      }),
      description: "Status badge",
    },

    Alert: {
      props: z.object({
        title: z.string(),
        message: z.string().nullable(),
        type: z.enum(["info", "success", "warning", "error"]).nullable(),
      }),
      description: "Alert banner",
    },

    Progress: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
      }),
      description: "Progress bar (value 0-100)",
    },

    Rating: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
      }),
      description: "Star rating display",
    },

    // Charts
    BarGraph: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          }),
        ),
      }),
      description: "Vertical bar chart",
    },

    LineGraph: {
      props: z.object({
        title: z.string().nullable(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          }),
        ),
      }),
      description: "Line chart with points",
    },
  },

  actions: {
    // Core state actions (built-in to the renderer)
    setState: {
      params: z.object({
        path: z.string(),
        value: z.unknown(),
      }),
      description: "Update a value in the state model at the given path.",
    },

    pushState: {
      params: z.object({
        path: z.string(),
        value: z.unknown(),
        clearPath: z.string().optional(),
      }),
      description:
        'Append an item to an array in the state model. The value can contain { path: "/statePath" } references to read from current state, and "$id" to auto-generate a unique ID. Use clearPath to reset another path after pushing (e.g. clear an input field).',
    },

    removeState: {
      params: z.object({
        path: z.string(),
        index: z.number(),
      }),
      description:
        "Remove an item from an array in the state model at the given index.",
    },

    // Demo actions for the playground
    buttonClick: {
      params: z.object({
        message: z.string().nullable(),
      }),
      description:
        "Triggered when a button is clicked. Shows a toast with the message.",
    },

    formSubmit: {
      params: z.object({
        formName: z.string().nullable(),
      }),
      description:
        "Triggered when a form is submitted. Shows a toast confirming submission.",
    },

    linkClick: {
      params: z.object({
        href: z.string(),
      }),
      description:
        "Triggered when a link is clicked. Shows a toast with the destination.",
    },
  },
});
