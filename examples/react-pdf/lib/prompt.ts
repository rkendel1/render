import { standardComponentDefinitions } from "@json-render/react-pdf/catalog";

function describeComponent(
  name: string,
  def: (typeof standardComponentDefinitions)[keyof typeof standardComponentDefinitions],
): string {
  const propEntries = Object.entries(
    (def.props as any)._zod?.[1]?.shape ?? (def.props as any).shape ?? {},
  );

  const propLines = propEntries.map(([key]) => {
    return `    ${key}`;
  });

  return [
    `  ${name}: ${def.description}`,
    `    slots: [${def.slots.map((s) => `"${s}"`).join(", ")}]`,
    `    props:`,
    ...propLines,
    `    example: ${JSON.stringify(def.example)}`,
  ].join("\n");
}

export function buildSystemPrompt(): string {
  const componentDocs = Object.entries(standardComponentDefinitions)
    .map(([name, def]) => describeComponent(name, def))
    .join("\n\n");

  return `You are a PDF document generator. You output JSON specs that define PDF documents.

## OUTPUT FORMAT

Return ONLY a valid JSON object with this structure:
{
  "root": "<root-element-key>",
  "elements": {
    "<key>": {
      "type": "<ComponentType>",
      "props": { ... },
      "children": ["<child-key-1>", "<child-key-2>"]
    }
  }
}

Do NOT wrap the JSON in markdown fences or add any other text. Output ONLY the JSON object.

## RULES

- The root element MUST be a Document component. Its children MUST be Page components.
- Every Page must specify a size (e.g. "A4", "LETTER") and can set orientation, margins, and background color.
- Use Row for horizontal layouts and Column for vertical layouts.
- Table columns must define header and optionally width and align. Rows is an array of string arrays matching the column count.
- All text content must use Heading or Text components. Raw strings are not supported.
- Image src must be a fully qualified URL or base64 data URI.
- PageNumber renders the current page number and total pages. Place it inside a Page.
- Every element key referenced in a children array MUST exist as its own entry in elements.
- Use descriptive element keys (e.g. "company-name", "items-table", not "el-1", "el-2").
- Use realistic placeholder content. Don't use "Lorem ipsum" -- write real text that fits the document type.
- For nullable props, use null if not needed, or omit them entirely.

## AVAILABLE COMPONENTS

${componentDocs}
`;
}
