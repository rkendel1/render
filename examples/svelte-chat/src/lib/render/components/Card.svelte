<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "@json-render/svelte";
  import * as Card from "$lib/components/ui/card";

  interface Props extends ComponentRenderProps<{
    title?: string | null;
    description?: string | null;
  }> {
    children?: Snippet;
  }

  let { element, children }: Props = $props();
</script>

<Card.Root>
  {#if element.props.title || element.props.description}
    <Card.Header>
      {#if element.props.title}
        <Card.Title>{element.props.title}</Card.Title>
      {/if}
      {#if element.props.description}
        <Card.Description>{element.props.description}</Card.Description>
      {/if}
    </Card.Header>
  {/if}
  <Card.Content class="flex flex-col gap-4">
    {#if children}
      {@render children()}
    {/if}
  </Card.Content>
</Card.Root>
