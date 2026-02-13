"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  runValidation,
  type ValidationConfig,
  type ValidationFunction,
  type ValidationResult,
} from "@json-render/core";
import { useStateStore } from "./state";

/**
 * Field validation state
 */
export interface FieldValidationState {
  /** Whether the field has been touched */
  touched: boolean;
  /** Whether the field has been validated */
  validated: boolean;
  /** Validation result */
  result: ValidationResult | null;
}

/**
 * Validation context value
 */
export interface ValidationContextValue {
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

const ValidationContext = createContext<ValidationContextValue | null>(null);

/**
 * Props for ValidationProvider
 */
export interface ValidationProviderProps {
  /** Custom validation functions from catalog */
  customFunctions?: Record<string, ValidationFunction>;
  children: ReactNode;
}

/**
 * Provider for validation
 */
export function ValidationProvider({
  customFunctions = {},
  children,
}: ValidationProviderProps) {
  const { state, authState } = useStateStore();
  const [fieldStates, setFieldStates] = useState<
    Record<string, FieldValidationState>
  >({});
  const [fieldConfigs, setFieldConfigs] = useState<
    Record<string, ValidationConfig>
  >({});

  const registerField = useCallback(
    (path: string, config: ValidationConfig) => {
      setFieldConfigs((prev) => ({ ...prev, [path]: config }));
    },
    [],
  );

  const validate = useCallback(
    (path: string, config: ValidationConfig): ValidationResult => {
      const value = state[path.split("/").filter(Boolean).join(".")];
      const result = runValidation(config, {
        value,
        stateModel: state,
        customFunctions,
        authState,
      });

      setFieldStates((prev) => ({
        ...prev,
        [path]: {
          touched: prev[path]?.touched ?? true,
          validated: true,
          result,
        },
      }));

      return result;
    },
    [state, customFunctions, authState],
  );

  const touch = useCallback((path: string) => {
    setFieldStates((prev) => ({
      ...prev,
      [path]: {
        ...prev[path],
        touched: true,
        validated: prev[path]?.validated ?? false,
        result: prev[path]?.result ?? null,
      },
    }));
  }, []);

  const clear = useCallback((path: string) => {
    setFieldStates((prev) => {
      const { [path]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const validateAll = useCallback(() => {
    let allValid = true;

    for (const [path, config] of Object.entries(fieldConfigs)) {
      const result = validate(path, config);
      if (!result.valid) {
        allValid = false;
      }
    }

    return allValid;
  }, [fieldConfigs, validate]);

  const value = useMemo<ValidationContextValue>(
    () => ({
      customFunctions,
      fieldStates,
      validate,
      touch,
      clear,
      validateAll,
      registerField,
    }),
    [
      customFunctions,
      fieldStates,
      validate,
      touch,
      clear,
      validateAll,
      registerField,
    ],
  );

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
}

/**
 * Hook to access validation context
 */
export function useValidation(): ValidationContextValue {
  const ctx = useContext(ValidationContext);
  if (!ctx) {
    throw new Error("useValidation must be used within a ValidationProvider");
  }
  return ctx;
}

/**
 * Hook to get validation state for a field
 */
export function useFieldValidation(
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
  const {
    fieldStates,
    validate: validateField,
    touch: touchField,
    clear: clearField,
    registerField,
  } = useValidation();

  // Stabilize config reference — callers typically pass an inline object
  // literal which creates a new reference every render.  We compare by
  // value (JSON) so the effect only re-runs when the config truly changes.
  const configRef = useRef(config);
  const configJson = useMemo(() => JSON.stringify(config), [config]);
  React.useEffect(() => {
    configRef.current = config;
  }, [configJson]);

  // Register field on mount (or when config value changes)
  React.useEffect(() => {
    if (configRef.current) {
      registerField(path, configRef.current);
    }
  }, [path, configJson, registerField]); // eslint-disable-line react-hooks/exhaustive-deps

  const state = fieldStates[path] ?? {
    touched: false,
    validated: false,
    result: null,
  };

  const validate = useCallback(
    () => validateField(path, config ?? { checks: [] }),
    [path, config, validateField],
  );

  const touch = useCallback(() => touchField(path), [path, touchField]);
  const clear = useCallback(() => clearField(path), [path, clearField]);

  return {
    state,
    validate,
    touch,
    clear,
    errors: state.result?.errors ?? [],
    isValid: state.result?.valid ?? true,
  };
}
