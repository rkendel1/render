<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { Badge } from "$lib/components/ui/badge";

  interface Props extends ComponentRenderProps<{
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | null;
  }> {}

  let { element }: Props = $props();
</script>

<Badge variant={element.props.variant ?? "default"}>{element.props.text}</Badge>
