import { getContext, setContext } from "svelte";
import {
  runValidation,
  type ValidationConfig,
  type ValidationFunction,
  type ValidationResult,
} from "@json-render/core";
import type { StateContext } from "./state.svelte";

const VALIDATION_KEY = Symbol("json-render-validation");

/**
 * Field validation state
 */
export interface FieldValidationState {
  touched: boolean;
  validated: boolean;
  result: ValidationResult | null;
}

/**
 * Validation context value
 */
export interface ValidationContext {
  /** Custom validation functions from catalog */
  customFunctions: Record<string, ValidationFunction>;
  /** Validation state by field path */
  fieldStates: Record<string, FieldValidationState>;
  /** Validate a field */
  validate: (path: string, config: ValidationConfig) => ValidationResult;
  /** Mark field as touched */
  touch: (path: string) => void;
  /** Clear validation for a field */
  clear: (path: string) => void;
  /** Validate all fields */
  validateAll: () => boolean;
  /** Register field config */
  registerField: (path: string, config: ValidationConfig) => void;
}

/**
 * Create a validation context
 */
export function createValidationContext(
  stateCtx: StateContext,
  customFunctions: Record<string, ValidationFunction> = {},
): ValidationContext {
  let fieldStates = $state<Record<string, FieldValidationState>>({});
  let fieldConfigs = $state<Record<string, ValidationConfig>>({});

  const validate = (
    path: string,
    config: ValidationConfig,
  ): ValidationResult => {
    // Walk the nested state object using JSON Pointer segments
    const segments = path.split("/").filter(Boolean);
    let value: unknown = stateCtx.state;
    for (const seg of segments) {
      if (value != null && typeof value === "object") {
        value = (value as Record<string, unknown>)[seg];
      } else {
        value = undefined;
        break;
      }
    }

    const result = runValidation(config, {
      value,
      stateModel: stateCtx.state,
      customFunctions,
    });

    fieldStates = {
      ...fieldStates,
      [path]: {
        touched: fieldStates[path]?.touched ?? true,
        validated: true,
        result,
      },
    };

    return result;
  };

  const touch = (path: string): void => {
    fieldStates = {
      ...fieldStates,
      [path]: {
        ...fieldStates[path],
        touched: true,
        validated: fieldStates[path]?.validated ?? false,
        result: fieldStates[path]?.result ?? null,
      },
    };
  };

  const clear = (path: string): void => {
    const { [path]: _, ...rest } = fieldStates;
    fieldStates = rest;
  };

  const validateAll = (): boolean => {
    let allValid = true;
    for (const [path, config] of Object.entries(fieldConfigs)) {
      const result = validate(path, config);
      if (!result.valid) {
        allValid = false;
      }
    }
    return allValid;
  };

  const registerField = (path: string, config: ValidationConfig): void => {
    fieldConfigs = { ...fieldConfigs, [path]: config };
  };

  const ctx: ValidationContext = {
    customFunctions,
    get fieldStates() {
      return fieldStates;
    },
    validate,
    touch,
    clear,
    validateAll,
    registerField,
  };

  setContext(VALIDATION_KEY, ctx);
  return ctx;
}

/**
 * Get the validation context from component tree
 */
export function getValidationContext(): ValidationContext {
  const ctx = getContext<ValidationContext>(VALIDATION_KEY);
  if (!ctx) {
    throw new Error(
      "getValidationContext must be called within a JsonUIProvider",
    );
  }
  return ctx;
}

/**
 * Helper to get field validation state
 */
export function getFieldValidation(
  ctx: ValidationContext,
  path: string,
  config?: ValidationConfig,
): {
  state: FieldValidationState;
  validate: () => ValidationResult;
  touch: () => void;
  clear: () => void;
  errors: string[];
  isValid: boolean;
} {
  const state = ctx.fieldStates[path] ?? {
    touched: false,
    validated: false,
    result: null,
  };

  return {
    state,
    validate: () => ctx.validate(path, config ?? { checks: [] }),
    touch: () => ctx.touch(path),
    clear: () => ctx.clear(path),
    errors: state.result?.errors ?? [],
    isValid: state.result?.valid ?? true,
  };
}
