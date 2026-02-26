<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { Button } from "$lib/components/ui/button";

  interface Props extends ComponentRenderProps<{
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | null;
    size?: "default" | "sm" | "lg" | null;
    disabled?: boolean | null;
  }> {}

  let { element, emit }: Props = $props();
</script>

<Button
  variant={element.props.variant ?? "default"}
  size={element.props.size ?? "default"}
  disabled={element.props.disabled ?? false}
  onclick={() => emit("press")}
>
  {element.props.label}
</Button>
