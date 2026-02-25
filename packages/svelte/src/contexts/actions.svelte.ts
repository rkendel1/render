import { getContext, setContext } from "svelte";
import {
  resolveAction,
  executeAction,
  type ActionBinding,
  type ActionHandler,
  type ActionConfirm,
  type ResolvedAction,
} from "@json-render/core";
import type { StateContext } from "./state.svelte";
import type { FieldValidationState } from "./validation.svelte.js";

const ACTION_KEY = Symbol("json-render-actions");

/**
 * Generate a unique ID for use with the "$id" token.
 */
let idCounter = 0;
function generateUniqueId(): string {
  idCounter += 1;
  return `${Date.now()}-${idCounter}`;
}

/**
 * Deep-resolve dynamic value references within an object.
 */
function deepResolveValue(
  value: unknown,
  get: (path: string) => unknown,
): unknown {
  if (value === null || value === undefined) return value;

  // "$id" string token -> generate unique ID
  if (value === "$id") {
    return generateUniqueId();
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    // { $state: "/foo" } -> read from state
    if (keys.length === 1 && typeof obj.$state === "string") {
      return get(obj.$state as string);
    }

    // { "$id": true } -> generate unique ID
    if (keys.length === 1 && "$id" in obj) {
      return generateUniqueId();
    }
  }

  // Recurse into arrays
  if (Array.isArray(value)) {
    return value.map((item) => deepResolveValue(item, get));
  }

  // Recurse into plain objects
  if (typeof value === "object") {
    const resolved: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      resolved[key] = deepResolveValue(val, get);
    }
    return resolved;
  }

  return value;
}

/**
 * Pending confirmation state
 */
export interface PendingConfirmation {
  action: ResolvedAction;
  handler: ActionHandler;
  resolve: () => void;
  reject: () => void;
}

export interface CurrentValue<T> {
  readonly current: T;
}

/**
 * Action context value
 */
export interface ActionContext {
  /** Registered action handlers */
  handlers: Record<string, ActionHandler>;
  /** Currently loading action names */
  loadingActions: Set<string>;
  /** Pending confirmation dialog */
  pendingConfirmation: PendingConfirmation | null;
  /** Execute an action binding */
  execute: (binding: ActionBinding) => Promise<void>;
  /** Confirm the pending action */
  confirm: () => void;
  /** Cancel the pending action */
  cancel: () => void;
  /** Register an action handler */
  registerHandler: (name: string, handler: ActionHandler) => void;
}

interface ValidationContextLike {
  validateAll: () => boolean;
  fieldStates: Record<string, FieldValidationState>;
}

type CreateActionContextOptions = {
  stateCtx: StateContext;
  handlers?: Record<string, ActionHandler>;
  navigate?: (path: string) => void;
  validation?: ValidationContextLike;
};

type CreateActionContextInput =
  | CreateActionContextOptions
  | (() => CreateActionContextOptions);

/**
 * Create an action context
 */
export function createActionContext(
  optionsOrGetter: CreateActionContextInput,
): ActionContext {
  const getOptions =
    typeof optionsOrGetter === "function"
      ? optionsOrGetter
      : () => optionsOrGetter;

  // Use $state for reactive parts
  let registeredHandlers = $state<Record<string, ActionHandler>>({});
  let loadingActions = $state<Set<string>>(new Set());
  let pendingConfirmation = $state<PendingConfirmation | null>(null);

  const execute = async (binding: ActionBinding): Promise<void> => {
    const { stateCtx, navigate, validation } = getOptions();
    const resolved = resolveAction(binding, stateCtx.getSnapshot());

    // Built-in: setState
    if (resolved.action === "setState" && resolved.params) {
      const statePath = resolved.params.statePath as string;
      const value = resolved.params.value;
      if (statePath) {
        stateCtx.set(statePath, value);
      }
      return;
    }

    // Built-in: pushState
    if (resolved.action === "pushState" && resolved.params) {
      const statePath = resolved.params.statePath as string;
      const rawValue = resolved.params.value;
      if (statePath) {
        const resolvedValue = deepResolveValue(rawValue, stateCtx.get);
        const arr = (stateCtx.get(statePath) as unknown[] | undefined) ?? [];
        stateCtx.set(statePath, [...arr, resolvedValue]);
        // Optionally clear a state path after pushing
        const clearStatePath = resolved.params.clearStatePath as
          | string
          | undefined;
        if (clearStatePath) {
          stateCtx.set(clearStatePath, "");
        }
      }
      return;
    }

    // Built-in: removeState
    if (resolved.action === "removeState" && resolved.params) {
      const statePath = resolved.params.statePath as string;
      const index = resolved.params.index as number;
      if (statePath !== undefined && index !== undefined) {
        const arr = (stateCtx.get(statePath) as unknown[] | undefined) ?? [];
        stateCtx.set(
          statePath,
          arr.filter((_, i) => i !== index),
        );
      }
      return;
    }

    // Built-in: validateForm — triggers validateAll and writes result to state
    if (resolved.action === "validateForm") {
      if (!validation?.validateAll) {
        console.warn(
          "validateForm action was dispatched but no ValidationProvider is connected. " +
            "Ensure ValidationProvider is rendered inside the provider tree.",
        );
        return;
      }
      const valid = validation.validateAll();
      const errors: Record<string, string[]> = {};
      for (const [path, fieldState] of Object.entries(validation.fieldStates)) {
        if (fieldState.result && !fieldState.result.valid) {
          errors[path] = fieldState.result.errors;
        }
      }
      const statePath =
        (resolved.params?.statePath as string) || "/formValidation";
      stateCtx.set(statePath, { valid, errors });
      return;
    }

    // Built-in: push (navigation)
    if (resolved.action === "push" && resolved.params) {
      const screen = resolved.params.screen as string;
      if (screen) {
        const currentScreen = stateCtx.get("/currentScreen") as
          | string
          | undefined;
        const navStack =
          (stateCtx.get("/navStack") as string[] | undefined) ?? [];
        if (currentScreen) {
          stateCtx.set("/navStack", [...navStack, currentScreen]);
        } else {
          stateCtx.set("/navStack", [...navStack, ""]);
        }
        stateCtx.set("/currentScreen", screen);
      }
      return;
    }

    // Built-in: pop (navigation)
    if (resolved.action === "pop") {
      const navStack =
        (stateCtx.get("/navStack") as string[] | undefined) ?? [];
      if (navStack.length > 0) {
        const previousScreen = navStack[navStack.length - 1];
        stateCtx.set("/navStack", navStack.slice(0, -1));
        if (previousScreen) {
          stateCtx.set("/currentScreen", previousScreen);
        } else {
          stateCtx.set("/currentScreen", undefined);
        }
      }
      return;
    }

    const handler =
      registeredHandlers[resolved.action] ??
      (getOptions().handlers ?? {})[resolved.action];

    if (!handler) {
      console.warn(`No handler registered for action: ${resolved.action}`);
      return;
    }

    // If confirmation is required, show dialog
    if (resolved.confirm) {
      return new Promise<void>((resolve, reject) => {
        pendingConfirmation = {
          action: resolved,
          handler,
          resolve: () => {
            pendingConfirmation = null;
            resolve();
          },
          reject: () => {
            pendingConfirmation = null;
            reject(new Error("Action cancelled"));
          },
        };
      }).then(async () => {
        loadingActions = new Set(loadingActions).add(resolved.action);
        try {
          await executeAction({
            action: resolved,
            handler,
            setState: stateCtx.set,
            navigate,
            executeAction: async (name) => {
              const subBinding: ActionBinding = { action: name };
              await execute(subBinding);
            },
          });
        } finally {
          const next = new Set(loadingActions);
          next.delete(resolved.action);
          loadingActions = next;
        }
      });
    }

    // Execute immediately
    loadingActions = new Set(loadingActions).add(resolved.action);
    try {
      await executeAction({
        action: resolved,
        handler,
        setState: stateCtx.set,
        navigate,
        executeAction: async (name) => {
          const subBinding: ActionBinding = { action: name };
          await execute(subBinding);
        },
      });
    } finally {
      const next = new Set(loadingActions);
      next.delete(resolved.action);
      loadingActions = next;
    }
  };

  const ctx: ActionContext = {
    get handlers() {
      return {
        ...(getOptions().handlers ?? {}),
        ...registeredHandlers,
      };
    },
    get loadingActions() {
      return loadingActions;
    },
    get pendingConfirmation() {
      return pendingConfirmation;
    },
    execute,
    confirm: () => {
      pendingConfirmation?.resolve();
    },
    cancel: () => {
      pendingConfirmation?.reject();
    },
    registerHandler: (name: string, handler: ActionHandler) => {
      registeredHandlers = { ...registeredHandlers, [name]: handler };
    },
  };

  setContext(ACTION_KEY, ctx);
  return ctx;
}

/**
 * Get the action context from component tree
 */
export function getActionContext(): ActionContext {
  const ctx = getContext<ActionContext>(ACTION_KEY);
  if (!ctx) {
    throw new Error("getActionContext must be called within a JsonUIProvider");
  }
  return ctx;
}

/**
 * Convenience helper to get a registered action handler by name
 */
export function getAction(
  name: string,
): CurrentValue<ActionHandler | undefined> {
  const context = getActionContext();
  return {
    get current() {
      return context.handlers[name];
    },
  };
}
