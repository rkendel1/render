<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { Progress } from "$lib/components/ui/progress";

  interface Props extends ComponentRenderProps<{
    value: number;
    max?: number | null;
  }> {}

  let { element }: Props = $props();
</script>

<Progress value={element.props.value} max={element.props.max ?? 100} />
