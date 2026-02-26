<script lang="ts">
  import type { ComponentRenderProps } from "@json-render/svelte";

  interface Props extends ComponentRenderProps<{
    content: string;
    muted?: boolean | null;
  }> {}

  let { element }: Props = $props();
</script>

<p class={element.props.muted ? "text-muted-foreground" : ""}>
  {element.props.content}
</p>
