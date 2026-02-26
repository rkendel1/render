<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";
  import { Separator } from "$lib/components/ui/separator";

  interface Props extends ComponentRenderProps<Record<string, never>> {}

  let {}: Props = $props();
</script>

<Separator />
