<script lang="ts">
  import type { Spec, UIElement } from "@json-render/core";
  import {
    resolveElementProps,
    resolveBindings,
    resolveActionParam,
    evaluateVisibility,
    type PropResolutionContext,
  } from "@json-render/core";
  import type { ComponentRegistry, ComponentRenderer } from "./types.js";
  import { getStateContext } from "./contexts/state.svelte.js";
  import { getActionContext } from "./contexts/actions.svelte.js";
  import { getRepeatScope } from "./contexts/repeat-scope.js";
  import RepeatChildren from "./RepeatChildren.svelte";
  import Self from "./ElementRenderer.svelte";

  interface Props {
    element: UIElement;
    spec: Spec;
    registry: ComponentRegistry;
    loading?: boolean;
    fallback?: ComponentRenderer;
  }

  let { element, spec, registry, loading = false, fallback }: Props = $props();

  const stateCtx = getStateContext();
  const actionCtx = getActionContext();
  const repeatScope = getRepeatScope();

  // Build context with repeat scope (used for both visibility and props)
  let fullCtx = $derived<PropResolutionContext>(
    repeatScope
      ? {
          stateModel: stateCtx.state,
          repeatItem: repeatScope.item,
          repeatIndex: repeatScope.index,
          repeatBasePath: repeatScope.basePath,
        }
      : { stateModel: stateCtx.state },
  );

  // Evaluate visibility
  let isVisible = $derived(
    element.visible === undefined
      ? true
      : evaluateVisibility(element.visible, fullCtx),
  );

  // Resolve props and bindings
  let rawProps = $derived(element.props as Record<string, unknown>);
  let resolvedProps = $derived(resolveElementProps(rawProps, fullCtx));
  let elementBindings = $derived(resolveBindings(rawProps, fullCtx));

  // Create resolved element
  let resolvedElement = $derived(
    resolvedProps !== element.props
      ? { ...element, props: resolvedProps }
      : element,
  );

  // Get the component renderer
  let Component = $derived(registry[resolvedElement.type] ?? fallback);

  // Create emit function
  function emit(eventName: string): void {
    const binding = element.on?.[eventName];
    if (!binding) return;

    const actionBindings = Array.isArray(binding) ? binding : [binding];
    for (const b of actionBindings) {
      if (!b.params) {
        actionCtx.execute(b);
        continue;
      }
      // Resolve all action params
      const resolved: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(b.params)) {
        resolved[key] = resolveActionParam(val, fullCtx);
      }
      actionCtx.execute({ ...b, params: resolved });
    }
  }
</script>

{#if isVisible && Component}
  <Component
    element={resolvedElement}
    bindings={elementBindings}
    {loading}
    {emit}>
    {#if resolvedElement.repeat}
      <RepeatChildren
        element={resolvedElement}
        {spec}
        {registry}
        {loading}
        {fallback} />
    {:else if resolvedElement.children}
      {#each resolvedElement.children as childKey (childKey)}
        {#if spec.elements[childKey]}
          <Self
            element={spec.elements[childKey]}
            {spec}
            {registry}
            {loading}
            {fallback} />
        {:else if !loading}
          <!-- Missing child element warning in dev -->
        {/if}
      {/each}
    {/if}
  </Component>
{/if}
