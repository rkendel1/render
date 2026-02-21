export interface NormalizedChoiceOption {
  label: string;
  value: string;
  source: "string" | "primitive" | "object";
}

export interface ChoiceOptionNormalizationResult {
  options: NormalizedChoiceOption[];
  objectCount: number;
  invalidCount: number;
}

function toText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function normalizeObjectOption(
  option: Record<string, unknown>,
): NormalizedChoiceOption | null {
  const rawLabel =
    option.label ?? option.name ?? option.title ?? option.text ?? option.value;
  const rawValue =
    option.value ?? option.id ?? option.key ?? option.label ?? option.name;
  const label = toText(rawLabel);
  const value = toText(rawValue);

  if (!label || !value) return null;

  return {
    label: label.trim(),
    value: value.trim(),
    source: "object",
  };
}

export function normalizeChoiceOptions(
  rawOptions: unknown[],
): ChoiceOptionNormalizationResult {
  const options: NormalizedChoiceOption[] = [];
  let objectCount = 0;
  let invalidCount = 0;

  for (const raw of rawOptions) {
    if (typeof raw === "string") {
      options.push({
        label: raw,
        value: raw,
        source: "string",
      });
      continue;
    }

    if (typeof raw === "number" || typeof raw === "boolean") {
      const text = String(raw);
      options.push({
        label: text,
        value: text,
        source: "primitive",
      });
      continue;
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      objectCount += 1;
      const normalized = normalizeObjectOption(raw as Record<string, unknown>);
      if (normalized) {
        options.push(normalized);
      } else {
        invalidCount += 1;
      }
      continue;
    }

    invalidCount += 1;
  }

  return { options, objectCount, invalidCount };
}
