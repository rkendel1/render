"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import {
  Renderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from "@json-render/react";

import { registry, Fallback } from "./registry";

// =============================================================================
// PlaygroundRenderer
// =============================================================================

interface PlaygroundRendererProps {
  spec: Spec | null;
  data?: Record<string, unknown>;
  loading?: boolean;
}

const fallbackRenderer = (renderProps: { element: { type: string } }) => (
  <Fallback type={renderProps.element.type} />
);

/**
 * Action handlers for the playground preview.
 * These are passed to ActionProvider so custom actions (buttonClick, formSubmit,
 * linkClick) work when triggered from the rendered UI.
 */
const actionHandlers: Record<
  string,
  (params: Record<string, unknown>) => void
> = {
  buttonClick: (params) => {
    const message = (params?.message as string) || "Button clicked!";
    toast.success(message);
  },
  formSubmit: (params) => {
    const formName = (params?.formName as string) || "Form";
    toast.success(`${formName} submitted successfully!`);
  },
  linkClick: (params) => {
    const href = (params?.href as string) || "#";
    toast.info(`Navigating to: ${href}`);
  },
};

export function PlaygroundRenderer({
  spec,
  data,
  loading,
}: PlaygroundRendererProps): ReactNode {
  if (!spec) return null;

  return (
    <StateProvider initialState={data ?? spec.state}>
      <VisibilityProvider>
        <ActionProvider handlers={actionHandlers}>
          <Renderer
            spec={spec}
            registry={registry}
            fallback={fallbackRenderer}
            loading={loading}
          />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
