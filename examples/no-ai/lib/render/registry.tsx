"use client";

import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";

let confettiListener: (() => void) | null = null;

export function onConfetti(cb: () => void) {
  confettiListener = cb;
  return () => {
    confettiListener = null;
  };
}

export const { registry } = defineRegistry(catalog, {
  components: {
    ...shadcnComponents,
  },
  actions: {
    confetti: async () => {
      confettiListener?.();
    },
  },
});

export const actionHandlers: Record<string, () => void> = {
  confetti: () => confettiListener?.(),
};
