<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ComponentRenderProps } from "@json-render/svelte";
  import * as Tabs from "$lib/components/ui/tabs";

  interface Props extends ComponentRenderProps<{
    value: string;
  }> {
    children?: Snippet;
  }

  let { element, children }: Props = $props();
</script>

<Tabs.Content value={element.props.value}>
  {#if children}
    {@render children()}
  {/if}
</Tabs.Content>
