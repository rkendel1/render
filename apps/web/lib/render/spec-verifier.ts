import { validateSpec, type Spec, type UIElement } from "@json-render/core";

import { normalizeChoiceOptions } from "./option-utils";

export type SpecVerificationSeverity = "error" | "warning";

export type SpecVerificationCode =
  | "structural_issue"
  | "rating_maybe_read_only"
  | "rating_value_out_of_range"
  | "choice_options_not_array"
  | "choice_invalid_option_shape"
  | "choice_object_options_detected"
  | "choice_value_not_in_options";

export interface SpecVerificationIssue {
  severity: SpecVerificationSeverity;
  code: SpecVerificationCode;
  message: string;
  elementKey?: string;
}

export interface SpecVerificationResult {
  passed: boolean;
  issues: SpecVerificationIssue[];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function hasValueBinding(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const ref = value as Record<string, unknown>;
  return (
    typeof ref.$bindState === "string" || typeof ref.$bindItem === "string"
  );
}

function hasEventBinding(element: UIElement, eventName: string): boolean {
  const eventBinding = element.on?.[eventName];
  if (!eventBinding) return false;
  if (Array.isArray(eventBinding)) return eventBinding.length > 0;
  return true;
}

function verifyRatingElement(
  key: string,
  element: UIElement,
): SpecVerificationIssue[] {
  const issues: SpecVerificationIssue[] = [];
  const props = asRecord(element.props);
  const rawValue = props.value;
  const rawMax = props.max;
  const value = typeof rawValue === "number" ? rawValue : null;
  const max = typeof rawMax === "number" && rawMax > 0 ? rawMax : 5;

  if (value !== null && (value < 0 || value > max)) {
    issues.push({
      severity: "error",
      code: "rating_value_out_of_range",
      elementKey: key,
      message: `Rating "${key}" has value ${value} outside range 0-${max}.`,
    });
  }

  const interactive = hasValueBinding(rawValue) || hasEventBinding(element, "change");
  if (!interactive && value !== null) {
    issues.push({
      severity: "warning",
      code: "rating_maybe_read_only",
      elementKey: key,
      message: `Rating "${key}" appears read-only (static value with no binding or on.change).`,
    });
  }

  return issues;
}

function verifyChoiceElement(
  key: string,
  element: UIElement,
  type: "Select" | "Radio",
): SpecVerificationIssue[] {
  const issues: SpecVerificationIssue[] = [];
  const props = asRecord(element.props);
  const rawOptions = props.options;

  if (!Array.isArray(rawOptions)) {
    issues.push({
      severity: "error",
      code: "choice_options_not_array",
      elementKey: key,
      message: `${type} "${key}" has invalid options. Expected an array.`,
    });
    return issues;
  }

  const normalized = normalizeChoiceOptions(rawOptions);

  if (normalized.invalidCount > 0) {
    issues.push({
      severity: "error",
      code: "choice_invalid_option_shape",
      elementKey: key,
      message: `${type} "${key}" has ${normalized.invalidCount} option(s) with unsupported shape.`,
    });
  }

  if (normalized.objectCount > 0) {
    issues.push({
      severity: "warning",
      code: "choice_object_options_detected",
      elementKey: key,
      message: `${type} "${key}" uses object options. Verify labels/values are correct.`,
    });
  }

  const value = props.value;
  if (
    typeof value === "string" &&
    value.length > 0 &&
    normalized.options.length > 0 &&
    !normalized.options.some((option) => option.value === value)
  ) {
    issues.push({
      severity: "warning",
      code: "choice_value_not_in_options",
      elementKey: key,
      message: `${type} "${key}" has value "${value}" that does not match any option.`,
    });
  }

  return issues;
}

export function verifyPlaygroundSpec(spec: Spec): SpecVerificationResult {
  const issues: SpecVerificationIssue[] = [];

  const structural = validateSpec(spec);
  for (const issue of structural.issues) {
    issues.push({
      severity: issue.severity,
      code: "structural_issue",
      message: issue.message,
      elementKey: issue.elementKey,
    });
  }

  for (const [key, element] of Object.entries(spec.elements)) {
    if (element.type === "Rating") {
      issues.push(...verifyRatingElement(key, element));
      continue;
    }

    if (element.type === "Select" || element.type === "Radio") {
      issues.push(...verifyChoiceElement(key, element, element.type));
    }
  }

  const hasErrors = issues.some((issue) => issue.severity === "error");
  return {
    passed: !hasErrors,
    issues,
  };
}

export function buildVerificationFixPrompt(options: {
  originalPrompt: string;
  issues: SpecVerificationIssue[];
}): string {
  const { originalPrompt, issues } = options;
  const lines = [
    `Fix the current generated UI spec to satisfy this request: "${originalPrompt}".`,
    "Keep layout/content intent, but repair invalid or non-interactive parts.",
    "Verification issues to fix:",
    ...issues.map((issue) => {
      const keyLabel = issue.elementKey ? ` (${issue.elementKey})` : "";
      return `- [${issue.severity}] ${issue.code}${keyLabel}: ${issue.message}`;
    }),
    "Required output format: JSONL patch operations only.",
    "Important constraints:",
    "- Rating used as user input must be interactive (bind value to state and handle on.change).",
    "- Select/Radio options must be plain strings or valid {label, value} objects.",
  ];

  return lines.join("\n");
}
