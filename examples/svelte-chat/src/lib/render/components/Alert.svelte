<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import * as Alert from "$lib/components/ui/alert";

  interface Props extends ComponentRenderProps<{
    variant?: "default" | "destructive" | null;
    title: string;
    description?: string | null;
  }> {}

  let { element }: Props = $props();
</script>

<Alert.Root variant={element.props.variant ?? "default"}>
  <Alert.Title>{element.props.title}</Alert.Title>
  {#if element.props.description}
    <Alert.Description>{element.props.description}</Alert.Description>
  {/if}
</Alert.Root>
